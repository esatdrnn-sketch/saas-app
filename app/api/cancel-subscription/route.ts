import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCancelAction, parseCancelReason } from "@/lib/cancellation";
import { fireTenantWebhook } from "@/lib/tenant-webhook";
import { sendTenantNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import { sendSlackNotification } from "@/lib/slack";
import { suspendIyzicoSubscription } from "@/lib/iyzico";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const statusByAction = {
  ACCEPT_DISCOUNT:  "ACTIVE",
  ACCEPT_PAUSE:     "PAUSED",
  ACCEPT_DOWNGRADE: "ACTIVE",
  CANCEL:           "CANCELLED",
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token       = body?.token as string | undefined;
    const actionInput = body?.action as string | undefined;
    const reasonInput = body?.reason as string | undefined;

    const action = actionInput ? parseCancelAction(actionInput) : null;
    const reason = reasonInput ? parseCancelReason(reasonInput) : null;

    if (!token || !action || !reason) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    // Rate limit: max 5 requests per token per hour
    if (!checkRateLimit(`cancel:${token}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Çok fazla istek. Lütfen bir süre bekleyin." }, { status: 429 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { updateToken: token },
      select: {
        id: true,
        status: true,
        customerEmail: true,
        customerPhone: true,
        planName: true,
        amount: true,
        currency: true,
        iyzicoSubRef: true,
        updateTokenExpiresAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            webhookUrl: true,
            slackWebhookUrl: true,
            notificationEmail: true,
            iyzicoApiKey: true,
            iyzicoSecretKey: true,
            iyzicoBaseUrl: true,
            offers: {
              where: { reason },
              select: { offerType: true, value: true },
            },
            emailConfig: { select: { fromName: true, replyTo: true, footerNote: true } },
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 404 });
    }

    // Token expiry check
    if (subscription.updateTokenExpiresAt && subscription.updateTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: "Bu bağlantının süresi dolmuş." }, { status: 410 });
    }

    if (subscription.status === "CANCELLED") {
      return NextResponse.json({ error: "Bu abonelik zaten iptal edilmiş." }, { status: 400 });
    }

    const newStatus = statusByAction[action];

    const tenantCreds = subscription.tenant.iyzicoApiKey && subscription.tenant.iyzicoSecretKey
      ? { apiKey: subscription.tenant.iyzicoApiKey, secretKey: subscription.tenant.iyzicoSecretKey, baseUrl: subscription.tenant.iyzicoBaseUrl ?? undefined }
      : undefined;

    let pauseUntil: Date | undefined;
    let discountedAmount: number | undefined;

    if (action === "ACCEPT_PAUSE") {
      const offer = subscription.tenant.offers[0];
      const pauseDays = offer?.value ?? 30;
      pauseUntil = new Date(Date.now() + pauseDays * DAY_MS);
      if (subscription.iyzicoSubRef) void suspendIyzicoSubscription(subscription.iyzicoSubRef, tenantCreds);
    }

    if (action === "ACCEPT_DISCOUNT") {
      const offer = subscription.tenant.offers[0];
      const pct = offer?.value ?? 30;
      if (subscription.amount) {
        discountedAmount = Math.round(subscription.amount * (1 - pct / 100) * 100) / 100;
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: newStatus,
        ...(pauseUntil      ? { pauseUntil }                                      : {}),
        ...(discountedAmount ? { amount: discountedAmount }                        : {}),
        ...(action === "CANCEL" ? { updateTokenExpiresAt: new Date(Date.now() + WEEK_MS) } : {}),
      },
      select: { status: true },
    });

    await prisma.cancellationEvent.create({
      data: { subscriptionId: subscription.id, reason, action },
    });

    writeAuditLog({
      action: "CANCEL_FLOW_COMPLETED",
      entityType: "Subscription",
      entityId: subscription.id,
      actorType: "CUSTOMER",
      metadata: { action, reason, newStatus },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const portalUrl = `${appUrl}/?token=${token}`;

    // Müşteri onay emaili
    if (subscription.customerEmail) {
      void sendCustomerConfirmationEmail({
        to: subscription.customerEmail,
        businessName: subscription.tenant.name,
        action,
        portalUrl,
        emailConfig: subscription.tenant.emailConfig,
      });
    }

    // Tenant bildirim emaili
    if (subscription.tenant.notificationEmail) {
      void sendTenantNotificationEmail({
        to: subscription.tenant.notificationEmail,
        tenantName: subscription.tenant.name,
        action,
        customerEmail: subscription.customerEmail,
        customerPhone: subscription.customerPhone,
        planName: subscription.planName,
        amount: subscription.amount,
        currency: subscription.currency,
        dashboardUrl: `${appUrl}/tenant/dashboard`,
      });
    }

    // Slack bildirimi
    if (subscription.tenant.slackWebhookUrl) {
      void sendSlackNotification(subscription.tenant.slackWebhookUrl, {
        action,
        tenantName: subscription.tenant.name,
        customerPhone: subscription.customerPhone,
        customerEmail: subscription.customerEmail,
        planName: subscription.planName,
        status: newStatus,
      });
    }

    // Tenant webhook
    if (subscription.tenant.webhookUrl) {
      void fireTenantWebhook(subscription.tenant.webhookUrl, {
        event: "subscription.status_changed",
        status: updated.status,
        action: actionInput,
        reason: reasonInput,
        customerEmail: subscription.customerEmail,
        customerPhone: subscription.customerPhone,
        planName: subscription.planName,
        amount: subscription.amount,
        currency: subscription.currency,
      });
    }

    return NextResponse.json({ status: updated.status, action: actionInput });
  } catch (error) {
    console.error("[cancel-subscription]", error);
    return NextResponse.json({ error: "İşlem sırasında bir hata oluştu." }, { status: 500 });
  }
}
