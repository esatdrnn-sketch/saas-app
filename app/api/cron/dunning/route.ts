import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpdatePaymentUrl, buildPortalUrl, buildShortPortalUrl } from "@/lib/app-url";
import { sendDunningEmail, sendWinbackEmail } from "@/lib/email";
import { activateIyzicoSubscription } from "@/lib/iyzico";
import { sendDunningMessage } from "@/lib/whatsapp";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let autoCancelled = 0;
  let reactivated = 0;
  let winbackSent = 0;

  // ── 1. Dunning: PAST_DUE abonelikler ─────────────────────────────────────
  const pastDueSubs = await prisma.subscription.findMany({
    where: { status: "PAST_DUE" },
    select: {
      id: true, customerEmail: true, customerPhone: true, updateToken: true, portalCode: true,
      planName: true, amount: true, currency: true,
      tenant: { select: { name: true } },
      dunningAttempts: {
        orderBy: { attemptNumber: "desc" }, take: 1,
        select: { attemptNumber: true, sentAt: true },
      },
      whatsAppSessions: {
        orderBy: { updatedAt: "desc" }, take: 1,
        select: { pendingOffer: true },
      },
      cancellationEvents: {
        orderBy: { createdAt: "desc" }, take: 1,
        select: { reason: true },
      },
    },
  });

  for (const sub of pastDueSubs) {
    const lastAttempt = sub.dunningAttempts[0];
    if (!lastAttempt) continue;
    const daysSince = (now.getTime() - lastAttempt.sentAt.getTime()) / DAY_MS;
    const updateUrl   = buildUpdatePaymentUrl(sub.updateToken);
    const shortUrl    = sub.portalCode ? buildShortPortalUrl(sub.portalCode) : updateUrl;
    const discountUrl = buildPortalUrl(sub.updateToken, "discount");
    const pauseUrl    = buildPortalUrl(sub.updateToken, "pause");

    // Müşteri profilinden teklif türünü belirle
    const pendingOffer = sub.whatsAppSessions[0]?.pendingOffer ?? null;
    const cancelReason = sub.cancellationEvents[0]?.reason ?? null;
    const offerType: "discount" | "pause" | "both" =
      pendingOffer === "discount" || cancelReason === "TOO_EXPENSIVE"  ? "discount" :
      pendingOffer === "pause"    || cancelReason === "TEMPORARY"      ? "pause"    :
      "both";

    if (lastAttempt.attemptNumber === 1 && daysSince >= 3) {
      if (sub.customerEmail) {
        await sendDunningEmail({
          to: sub.customerEmail, businessName: sub.tenant.name,
          updateUrl, discountUrl, pauseUrl, offerType,
          attemptNumber: 2, planName: sub.planName, amount: sub.amount, currency: sub.currency,
        }).catch((e) => console.error("[Cron] 2. e-posta:", e));
        await prisma.dunningAttempt.create({ data: { subscriptionId: sub.id, attemptNumber: 2, emailTo: sub.customerEmail } });
      }
      void prisma.whatsAppSession.upsert({
        where: { phone_subscriptionId: { phone: sub.customerPhone, subscriptionId: sub.id } },
        create: { phone: sub.customerPhone, subscriptionId: sub.id, step: "AWAITING_REASON" },
        update: { step: "AWAITING_REASON", pendingOffer: null },
      }).catch(() => null);
      void sendDunningMessage(sub.customerPhone, sub.tenant.name, shortUrl)
        .catch((e) => console.error("[Cron] 2. WhatsApp:", e));
      sent++;
      continue;
    }

    if (lastAttempt.attemptNumber === 2 && daysSince >= 4) {
      if (sub.customerEmail) {
        await sendDunningEmail({
          to: sub.customerEmail, businessName: sub.tenant.name,
          updateUrl, discountUrl, pauseUrl, offerType,
          attemptNumber: 3, planName: sub.planName, amount: sub.amount, currency: sub.currency,
        }).catch((e) => console.error("[Cron] 3. e-posta:", e));
        await prisma.dunningAttempt.create({ data: { subscriptionId: sub.id, attemptNumber: 3, emailTo: sub.customerEmail } });
      }
      void sendDunningMessage(sub.customerPhone, sub.tenant.name, shortUrl)
        .catch((e) => console.error("[Cron] 3. WhatsApp:", e));
      sent++;
      continue;
    }

    if (lastAttempt.attemptNumber === 3 && daysSince >= 1) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: "CANCELLED" } });
      console.log(`[Cron] Otomatik iptal: ${sub.id}`);
      autoCancelled++;
    }
  }

  // ── 2. Critical 2: Pause süresi dolan abonelikler → ACTIVE ───────────────
  const expiredPaused = await prisma.subscription.findMany({
    where: { status: "PAUSED", pauseUntil: { lte: now } },
    select: {
      id: true, iyzicoSubRef: true,
      tenant: { select: { iyzicoApiKey: true, iyzicoSecretKey: true, iyzicoBaseUrl: true } },
    },
  });

  for (const sub of expiredPaused) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE", pauseUntil: null },
    });
    if (sub.iyzicoSubRef) {
      const creds = sub.tenant.iyzicoApiKey && sub.tenant.iyzicoSecretKey
        ? { apiKey: sub.tenant.iyzicoApiKey, secretKey: sub.tenant.iyzicoSecretKey, baseUrl: sub.tenant.iyzicoBaseUrl ?? undefined }
        : undefined;
      void activateIyzicoSubscription(sub.iyzicoSubRef, creds);
    }
    console.log(`[Cron] Pause süresi doldu → ACTIVE: ${sub.id}`);
    reactivated++;
  }

  // ── 3. Medium 5: Winback — iptal edilenler ───────────────────────────────
  const cancelledSubs = await prisma.subscription.findMany({
    where: {
      status: "CANCELLED",
      customerEmail: { not: null },
      winbackSentAt: null,
    },
    select: {
      id: true,
      customerEmail: true,
      updateToken: true,
      planName: true,
      amount: true,
      currency: true,
      updatedAt: true,
      tenant: { select: { name: true, winbackDays: true } },
    },
  });

  for (const sub of cancelledSubs) {
    if (!sub.customerEmail) continue;
    const winbackDays = sub.tenant.winbackDays;
    if (winbackDays <= 0) continue; // 0 = devre dışı
    const daysSinceCancel = (now.getTime() - sub.updatedAt.getTime()) / DAY_MS;
    if (daysSinceCancel < winbackDays) continue;

    const portalUrl = `${appUrl}/?token=${sub.updateToken}`;
    await sendWinbackEmail({
      to: sub.customerEmail,
      businessName: sub.tenant.name,
      portalUrl,
      planName: sub.planName,
      amount: sub.amount,
      currency: sub.currency,
    }).catch((e) => console.error("[Cron] Winback e-posta:", e));

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { winbackSentAt: now },
    });
    winbackSent++;
  }

  console.log(`[Dunning Cron] ${sent} dunning, ${autoCancelled} iptal, ${reactivated} reaktivasyon, ${winbackSent} winback.`);
  return NextResponse.json({ ok: true, sent, autoCancelled, reactivated, winbackSent });
}
