import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendCardUpdateLink,
  sendDiscountOffer,
  sendDiscountLink,
  sendPauseOffer,
  sendPauseLink,
  sendCancelLink,
  sendTechnicalSupportMessage,
  sendSalaryDatePauseOffer,
} from "@/lib/whatsapp";

// Twilio bunu form-encoded olarak gönderir
async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const text = await req.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((v, k) => { result[k] = v; });
  return result;
}

function normalize(phone: string): string {
  // whatsapp:+905551234567 → +905551234567
  // 05551234567 → +905551234567
  let p = phone.replace(/^whatsapp:/, "").replace(/\s/g, "");
  if (p.startsWith("0") && p.length === 11) p = "+90" + p.slice(1);
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

function parseChoice(body: string): string {
  const trimmed = body.trim().toLowerCase();
  // Sayısal cevap veya anahtar kelime
  if (["1", "evet", "e", "yes", "ok", "tamam"].includes(trimmed)) return "1";
  if (["2", "hayır", "hayir", "h", "no", "n"].includes(trimmed)) return "2";
  if (trimmed === "3") return "3";
  if (trimmed === "4") return "4";
  if (trimmed === "5") return "5";
  return trimmed;
}

export async function POST(req: NextRequest) {
  const data = await parseBody(req);
  const from  = normalize(data["From"] ?? "");
  const body  = (data["Body"] ?? "").trim();
  console.log(`[WhatsApp Webhook] from=${from} body=${body}`);

  if (!from || !body) return twimlEmpty();

  // Bu telefon numarasına ait aktif session bul
  const session = await prisma.whatsAppSession.findFirst({
    where: { phone: from, step: { not: "DONE" } },
    include: {
      subscription: {
        include: { tenant: { select: { name: true, offers: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!session) {
    console.log(`[WhatsApp Webhook] Aktif session bulunamadı. from=${from}`);
    return twimlEmpty();
  }

  const sub     = session.subscription;
  const token   = sub.updateToken;
  const choice  = parseChoice(body);
  const tenantName = sub.tenant.name;

  // Tenant'ın discount offer değerini bul
  const discountOffer = sub.tenant.offers.find((o) => o.reason === "TOO_EXPENSIVE" && o.offerType === "DISCOUNT");
  const discountPct   = discountOffer?.value ?? 30;

  if (session.step === "AWAITING_REASON") {
    if (choice === "1") {
      // Kartı güncelle
      await sendCardUpdateLink(from, token);
      await prisma.whatsAppSession.update({ where: { id: session.id }, data: { step: "DONE" } });

    } else if (choice === "2") {
      // Çok pahalı → discount teklifi
      await sendDiscountOffer(from, tenantName, discountPct);
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "AWAITING_DISCOUNT_CONFIRM", pendingOffer: "discount" },
      });

    } else if (choice === "3") {
      // Şimdilik ihtiyacım yok → pause teklifi
      await sendPauseOffer(from, tenantName);
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "AWAITING_PAUSE_CONFIRM", pendingOffer: "pause" },
      });

    } else if (choice === "4") {
      // Teknik sorun
      await sendTechnicalSupportMessage(from, token);
      await prisma.whatsAppSession.update({ where: { id: session.id }, data: { step: "DONE" } });

    } else if (choice === "5") {
      // Ödeme tarihi maaş gününe uymuyor → maaş gününe kadar dondur
      await sendSalaryDatePauseOffer(from, tenantName);
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "AWAITING_PAUSE_CONFIRM", pendingOffer: "pause" },
      });

    }
    // Anlamsız giriş → cevap verme (spam önleme)

  } else if (session.step === "AWAITING_DISCOUNT_CONFIRM") {
    if (choice === "1") {
      await sendDiscountLink(from, token);
    } else {
      await sendCancelLink(from, token);
    }
    await prisma.whatsAppSession.update({ where: { id: session.id }, data: { step: "DONE" } });

  } else if (session.step === "AWAITING_PAUSE_CONFIRM") {
    if (choice === "1") {
      await sendPauseLink(from, token);
    } else {
      await sendCancelLink(from, token);
    }
    await prisma.whatsAppSession.update({ where: { id: session.id }, data: { step: "DONE" } });

  }

  return twimlEmpty();
}

function twimlEmpty() {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
