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
      customerPhone: true,
      customerEmail: true,
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
    const updateToken = generateUpdateToken();
    const updateUrl = buildUpdatePaymentUrl(updateToken);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAST_DUE", updateToken },
    });

    // WhatsApp / SMS bildirimi
    await sendDunningMessage(
      subscription.customerPhone,
      subscription.tenant.name,
      updateUrl
    );

    // E-posta: 1. deneme (anında)
    if (subscription.customerEmail) {
      await sendDunningEmail({
        to: subscription.customerEmail,
        businessName: subscription.tenant.name,
        updateUrl,
        attemptNumber: 1,
      });

      await prisma.dunningAttempt.create({
        data: {
          subscriptionId: subscription.id,
          attemptNumber: 1,
          emailTo: subscription.customerEmail,
        },
      });
    }

    console.log(
      `[iyzico Webhook] Ödeme başarısız → PAST_DUE: ${webhook.subscriptionReferenceCode}`
    );
    return NextResponse.json({ received: true, status: "PAST_DUE" });
  }

  // payment.success
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE" },
  });

  console.log(
    `[iyzico Webhook] Ödeme başarılı → ACTIVE: ${webhook.subscriptionReferenceCode}`
  );
  return NextResponse.json({ received: true, status: "ACTIVE" });
}
