import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpdatePaymentUrl } from "@/lib/app-url";
import { sendDunningEmail } from "@/lib/email";

// Vercel Cron bu endpoint'i çağırırken CRON_SECRET header'ı gönderir
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // geliştirme ortamında serbest
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const now = new Date();

  // PAST_DUE abonelikleri + mevcut deneme sayıları
  const pastDueSubscriptions = await prisma.subscription.findMany({
    where: { status: "PAST_DUE", customerEmail: { not: null } },
    select: {
      id: true,
      customerEmail: true,
      updateToken: true,
      tenant: { select: { name: true } },
      dunningAttempts: {
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: { attemptNumber: true, sentAt: true },
      },
    },
  });

  let sent = 0;

  for (const sub of pastDueSubscriptions) {
    if (!sub.customerEmail) continue;

    const lastAttempt = sub.dunningAttempts[0];
    if (!lastAttempt) continue;

    const daysSinceLastAttempt =
      (now.getTime() - lastAttempt.sentAt.getTime()) / DAY_MS;

    const updateUrl = buildUpdatePaymentUrl(sub.updateToken);

    // 2. deneme: 1. denemeden 3+ gün sonra
    if (lastAttempt.attemptNumber === 1 && daysSinceLastAttempt >= 3) {
      await sendDunningEmail({
        to: sub.customerEmail,
        businessName: sub.tenant.name,
        updateUrl,
        attemptNumber: 2,
      });
      await prisma.dunningAttempt.create({
        data: {
          subscriptionId: sub.id,
          attemptNumber: 2,
          emailTo: sub.customerEmail,
        },
      });
      sent++;
      continue;
    }

    // 3. deneme: 2. denemeden 4+ gün sonra (toplam 7. gün)
    if (lastAttempt.attemptNumber === 2 && daysSinceLastAttempt >= 4) {
      await sendDunningEmail({
        to: sub.customerEmail,
        businessName: sub.tenant.name,
        updateUrl,
        attemptNumber: 3,
      });
      await prisma.dunningAttempt.create({
        data: {
          subscriptionId: sub.id,
          attemptNumber: 3,
          emailTo: sub.customerEmail,
        },
      });
      sent++;
    }
  }

  console.log(`[Dunning Cron] ${sent} e-posta gönderildi.`);
  return NextResponse.json({ ok: true, sent });
}
