import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTenantNotificationEmail } from "@/lib/email";
import { fireTenantWebhook } from "@/lib/tenant-webhook";
import { sendSlackNotification } from "@/lib/slack";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token) return NextResponse.json({ error: "Token gerekli." }, { status: 400 });

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
        tenant: {
          select: {
            id: true,
            name: true,
            webhookUrl: true,
            slackWebhookUrl: true,
            notificationEmail: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Geçersiz bağlantı." }, { status: 404 });
    }

    if (subscription.status !== "CANCELLED") {
      return NextResponse.json({ error: "Bu abonelik iptal durumunda değil." }, { status: 400 });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE", updateTokenExpiresAt: null },
    });

    writeAuditLog({
      action: "SUBSCRIPTION_REACTIVATED",
      entityType: "Subscription",
      entityId: subscription.id,
      actorType: "CUSTOMER",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    if (subscription.tenant.notificationEmail) {
      void sendTenantNotificationEmail({
        to: subscription.tenant.notificationEmail,
        tenantName: subscription.tenant.name,
        action: "REACTIVATED",
        customerEmail: subscription.customerEmail,
        customerPhone: subscription.customerPhone,
        planName: subscription.planName,
        amount: subscription.amount,
        currency: subscription.currency,
        dashboardUrl: `${appUrl}/tenant/dashboard`,
      });
    }

    if (subscription.tenant.webhookUrl) {
      void fireTenantWebhook(subscription.tenant.webhookUrl, {
        event: "subscription.reactivated",
        status: "ACTIVE",
        customerEmail: subscription.customerEmail,
        customerPhone: subscription.customerPhone,
        planName: subscription.planName,
      });
    }

    if (subscription.tenant.slackWebhookUrl) {
      void sendSlackNotification(subscription.tenant.slackWebhookUrl, {
        action: "REACTIVATED",
        tenantName: subscription.tenant.name,
        customerPhone: subscription.customerPhone,
        customerEmail: subscription.customerEmail,
        planName: subscription.planName,
        status: "ACTIVE",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reactivate]", err);
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
