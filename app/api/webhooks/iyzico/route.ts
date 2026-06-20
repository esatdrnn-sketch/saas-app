import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseIyzicoWebhook,
  verifyIyzicoWebhookSignature,
} from "@/lib/iyzico-webhook";
import { generateUpdateToken } from "@/lib/subscription-token";
import { buildUpdatePaymentUrl } from "@/lib/app-url";
import { sendDunningMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-iyzico-signature");

  if (!verifyIyzicoWebhookSignature(rawBody, signature)) {
    console.warn(
      `[iyzico Webhook] İmza doğrulama başarısız. IP: ${req.headers.get("x-forwarded-for") ?? "bilinmiyor"}, Signature: ${signature}`
    );
    return NextResponse.json(
      { error: "Geçersiz webhook imzası." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Geçersiz JSON gövdesi." },
      { status: 400 }
    );
  }

  const webhook = parseIyzicoWebhook(body);

  if (!webhook) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { iyzicoSubRef: webhook.subscriptionReferenceCode },
    select: {
      id: true,
      customerPhone: true,
      tenant: {
        select: {
          name: true,
        },
      },
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
      data: {
        status: "PAST_DUE",
        updateToken,
      },
    });

    await sendDunningMessage(
      subscription.customerPhone,
      subscription.tenant.name,
      updateUrl
    );

    return NextResponse.json({ received: true, status: "PAST_DUE" });
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json({ received: true, status: "ACTIVE" });
}
