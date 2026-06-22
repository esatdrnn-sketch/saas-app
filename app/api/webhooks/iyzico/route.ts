import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  type IyzicoRawPayload,
  parseIyzicoWebhook,
  verifyIyzicoWebhookSignature,
} from "@/lib/iyzico-webhook";
import { generateUpdateToken } from "@/lib/subscription-token";
import { buildUpdatePaymentUrl } from "@/lib/app-url";
import { sendDunningMessage } from "@/lib/whatsapp";
import { sendDunningEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  let rawPayload: IyzicoRawPayload;

  try {
    rawPayload = (await req.json()) as IyzicoRawPayload;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz JSON gövdesi." },
      { status: 400 }
    );
  }

  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!secretKey) {
    console.error("[iyzico Webhook] IYZICO_SECRET_KEY tanımlı değil.");
    return NextResponse.json(
      { error: "Sunucu yapılandırma hatası." },
      { status: 500 }
    );
  }

  // iyzico imza doğrulama: SHA-1(secretKey + iyziReferenceCode + iyziEventType) → base64
  if (!verifyIyzicoWebhookSignature(rawPayload, secretKey)) {
    console.warn(
      `[iyzico Webhook] İmza doğrulama başarısız. IP: ${req.headers.get("x-forwarded-for") ?? "bilinmiyor"}`,
      {
        iyziEventType: rawPayload.iyziEventType,
        iyziReferenceCode: rawPayload.iyziReferenceCode,
        iyziSignature: rawPayload.iyziSignature,
      }
    );
    return NextResponse.json(
      { error: "Geçersiz webhook imzası." },
      { status: 401 }
    );
  }

  const webhook = parseIyzicoWebhook(rawPayload);

  if (!webhook) {
    // Tanımadığımız event tipi — 200 döndürüyoruz ki iyzico tekrar göndermesın
    console.log(
      `[iyzico Webhook] Tanımadık event atlandı: ${rawPayload.iyziEventType}`
    );
    return NextResponse.json({ received: true, ignored: true });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { iyzicoSubRef: webhook.subscriptionReferenceCode },
    select: {
      id: true,
      status: true,
      customerPhone: true,
      customerEmail: true,
      planName: true,
      amount: true,
      currency: true,
      tenant: { select: { name: true } },
    },
  });

  if (!subscription) {
    console.log(
      `[iyzico Webhook] Abonelik bulunamadı: ${webhook.subscriptionReferenceCode}`
    );
    return NextResponse.json({ received: true });
  }

  if (webhook.event === "payment.failed") {
    // İdempotency: zaten PAST_DUE ise tekrar işleme
    if (subscription.status === "PAST_DUE") {
      return NextResponse.json({ received: true, skipped: true, reason: "already_past_due" });
    }

    const updateToken = generateUpdateToken();
    const updateUrl = buildUpdatePaymentUrl(updateToken);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAST_DUE", updateToken },
    });

    await sendDunningMessage(
      subscription.customerPhone,
      subscription.tenant.name,
      updateUrl
    ).catch((err) =>
      console.error("[Webhook] WhatsApp gönderim hatası:", err)
    );

    if (subscription.customerEmail) {
      try {
        await sendDunningEmail({
          to: subscription.customerEmail,
          businessName: subscription.tenant.name,
          updateUrl,
          attemptNumber: 1,
          planName: subscription.planName,
          amount: subscription.amount,
          currency: subscription.currency,
        });

        await prisma.dunningAttempt.create({
          data: {
            subscriptionId: subscription.id,
            attemptNumber: 1,
            emailTo: subscription.customerEmail,
          },
        });
      } catch (emailErr) {
        console.error("[Webhook] E-posta gönderim hatası:", emailErr);
      }
    }

    console.log(
      `[iyzico Webhook] Ödeme başarısız → PAST_DUE: ${webhook.subscriptionReferenceCode}`
    );
    return NextResponse.json({ received: true, status: "PAST_DUE" });
  }

  // card.updated → PAST_DUE'dan kurtarıldı
  if (webhook.event === "card.updated") {
    if (subscription.status === "RECOVERED") {
      return NextResponse.json({ received: true, skipped: true, reason: "already_recovered" });
    }
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "RECOVERED" },
    });
    console.log(
      `[iyzico Webhook] Kart güncellendi → RECOVERED: ${webhook.subscriptionReferenceCode}`
    );
    return NextResponse.json({ received: true, status: "RECOVERED" });
  }

  // payment.success
  if (subscription.status === "ACTIVE") {
    return NextResponse.json({ received: true, skipped: true, reason: "already_active" });
  }
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE" },
  });

  console.log(
    `[iyzico Webhook] Ödeme başarılı → ACTIVE: ${webhook.subscriptionReferenceCode}`
  );
  return NextResponse.json({ received: true, status: "ACTIVE" });
}
