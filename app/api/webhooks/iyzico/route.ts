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
import { sendDunningEmail, sendTenantNotificationEmail } from "@/lib/email";
import { fireTenantWebhook } from "@/lib/tenant-webhook";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function POST(req: NextRequest) {
  let rawPayload: IyzicoRawPayload;

  try {
    rawPayload = (await req.json()) as IyzicoRawPayload;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Sunucu yapılandırma hatası." }, { status: 500 });
  }

  if (!verifyIyzicoWebhookSignature(rawPayload, secretKey)) {
    console.warn("[iyzico Webhook] İmza doğrulama başarısız.");
    return NextResponse.json({ error: "Geçersiz webhook imzası." }, { status: 401 });
  }

  const webhook = parseIyzicoWebhook(rawPayload);
  if (!webhook) {
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
      tenant: { select: { name: true, webhookUrl: true, notificationEmail: true } },
    },
  });

  if (!subscription) {
    return NextResponse.json({ received: true });
  }

  async function notifyTenant(action: string, status: string) {
    if (subscription!.tenant.notificationEmail) {
      void sendTenantNotificationEmail({
        to: subscription!.tenant.notificationEmail,
        tenantName: subscription!.tenant.name,
        action,
        customerEmail: subscription!.customerEmail,
        customerPhone: subscription!.customerPhone,
        planName: subscription!.planName,
        amount: subscription!.amount,
        currency: subscription!.currency,
        dashboardUrl: `${appUrl}/tenant/dashboard`,
      });
    }
    if (subscription!.tenant.webhookUrl) {
      void fireTenantWebhook(subscription!.tenant.webhookUrl, {
        event: `subscription.${action.toLowerCase()}`,
        status,
        customerEmail: subscription!.customerEmail,
        customerPhone: subscription!.customerPhone,
        planName: subscription!.planName,
        amount: subscription!.amount,
        currency: subscription!.currency,
      });
    }
  }

  // ── payment.failed ────────────────────────────────────────────────────────
  if (webhook.event === "payment.failed") {
    if (subscription.status === "PAST_DUE") {
      return NextResponse.json({ received: true, skipped: true, reason: "already_past_due" });
    }

    const updateToken = generateUpdateToken();
    const updateUrl = buildUpdatePaymentUrl(updateToken);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAST_DUE", updateToken },
    });

    // WhatsApp session oluştur (konuşma akışı için)
    void prisma.whatsAppSession.upsert({
      where: { phone_subscriptionId: { phone: subscription.customerPhone, subscriptionId: subscription.id } },
      create: { phone: subscription.customerPhone, subscriptionId: subscription.id, step: "AWAITING_REASON" },
      update: { step: "AWAITING_REASON", pendingOffer: null },
    }).catch(() => null);

    await sendDunningMessage(subscription.customerPhone, subscription.tenant.name, updateUrl)
      .catch((err) => console.error("[Webhook] WhatsApp hatası:", err));

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
          data: { subscriptionId: subscription.id, attemptNumber: 1, emailTo: subscription.customerEmail },
        });
      } catch (e) {
        console.error("[Webhook] E-posta hatası:", e);
      }
    }

    await notifyTenant("payment_failed", "PAST_DUE");
    return NextResponse.json({ received: true, status: "PAST_DUE" });
  }

  // ── card.updated → RECOVERED ──────────────────────────────────────────────
  if (webhook.event === "card.updated") {
    if (subscription.status === "RECOVERED") {
      return NextResponse.json({ received: true, skipped: true, reason: "already_recovered" });
    }
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "RECOVERED" } });
    await notifyTenant("recovered", "RECOVERED");
    return NextResponse.json({ received: true, status: "RECOVERED" });
  }

  // ── payment.success → ACTIVE ──────────────────────────────────────────────
  if (subscription.status === "ACTIVE") {
    return NextResponse.json({ received: true, skipped: true, reason: "already_active" });
  }
  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "ACTIVE" } });
  await notifyTenant("payment_success", "ACTIVE");
  return NextResponse.json({ received: true, status: "ACTIVE" });
}
