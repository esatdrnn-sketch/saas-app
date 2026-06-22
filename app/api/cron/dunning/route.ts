import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpdatePaymentUrl } from "@/lib/app-url";
import { sendDunningEmail } from "@/lib/email";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const now = new Date();

  const pastDueSubscriptions = await prisma.subscription.findMany({
    where: { status: "PAST_DUE", customerEmail: { not: null } },
    select: {
      id: true,
      customerEmail: true,
      updateToken: true,
      planName: true,
      amount: true,
      currency: true,
      tenant: { select: { name: true } },
      dunningAttempts: {
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: { attemptNumber: true, sentAt: true },
      },
    },
  });

  let sent = 0;
  let autoCancelled = 0;

  for (const sub of pastDueSubscriptions) {
    if (!sub.customerEmail) continue;

    const lastAttempt = sub.dunningAttempts[0];
    if (!lastAttempt) continue;

    const daysSince = (now.getTime() - lastAttempt.sentAt.getTime()) / DAY_MS;
    const updateUrl = buildUpdatePaymentUrl(sub.updateToken);

    if (lastAttempt.attemptNumber === 1 && daysSince >= 3) {
      await sendDunningEmail({
        to: sub.customerEmail,
        businessName: sub.tenant.name,
        updateUrl,
        attemptNumber: 2,
        planName: sub.planName,
        amount: sub.amount,
        currency: sub.currency,
      }).catch((e) => console.error("[Cron] 2. e-posta hatası:", e));
      await prisma.dunningAttempt.create({
        data: { subscriptionId: sub.id, attemptNumber: 2, emailTo: sub.customerEmail },
      });
      sent++;
      continue;
    }

    if (lastAttempt.attemptNumber === 2 && daysSince >= 4) {
      await sendDunningEmail({
        to: sub.customerEmail,
        businessName: sub.tenant.name,
        updateUrl,
        attemptNumber: 3,
        planName: sub.planName,
        amount: sub.amount,
        currency: sub.currency,
      }).catch((e) => console.error("[Cron] 3. e-posta hatası:", e));
      await prisma.dunningAttempt.create({
        data: { subscriptionId: sub.id, attemptNumber: 3, emailTo: sub.customerEmail },
      });
      sent++;
      continue;
    }

    // 3. deneme gönderildikten 1+ gün sonra hâlâ PAST_DUE → otomatik iptal
    if (lastAttempt.attemptNumber === 3 && daysSince >= 1) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "CANCELLED" },
      });
      console.log(`[Cron] Otomatik iptal: ${sub.id} (3. deneme + ${Math.floor(daysSince)}g geçti)`);
      autoCancelled++;
    }
  }

  console.log(`[Dunning Cron] ${sent} e-posta, ${autoCancelled} otomatik iptal.`);
  return NextResponse.json({ ok: true, sent, autoCancelled });
}
