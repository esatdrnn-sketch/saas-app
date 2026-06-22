import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { buildUpdatePaymentUrl } from "@/lib/app-url";
import { sendDunningEmail } from "@/lib/email";
import { sendDunningMessage } from "@/lib/whatsapp";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { subscriptionId } = (await req.json()) as { subscriptionId?: string };
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId zorunlu." }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      tenant: true,
      dunningAttempts: { orderBy: { attemptNumber: "desc" }, take: 1 },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Abonelik bulunamadı." }, { status: 404 });
  }

  if (subscription.status === "CANCELLED" || subscription.status === "ACTIVE") {
    return NextResponse.json(
      { error: "Bu abonelik için dunning gönderilemez." },
      { status: 400 }
    );
  }

  const lastAttempt = subscription.dunningAttempts[0];
  const nextAttemptNumber = lastAttempt
    ? ((lastAttempt.attemptNumber + 1) as 1 | 2 | 3)
    : 1;

  if (nextAttemptNumber > 3) {
    return NextResponse.json(
      { error: "3 deneme tamamlandı, başka gönderim yapılamaz." },
      { status: 400 }
    );
  }

  const updateUrl = buildUpdatePaymentUrl(subscription.updateToken);

  if (subscription.customerEmail) {
    await sendDunningEmail({
      to: subscription.customerEmail,
      businessName: subscription.tenant.name,
      updateUrl,
      attemptNumber: nextAttemptNumber,
    }).catch((e) => console.error("[Admin Dunning] E-posta hatası:", e));

    await prisma.dunningAttempt.create({
      data: {
        subscriptionId: subscription.id,
        attemptNumber: nextAttemptNumber,
        emailTo: subscription.customerEmail,
      },
    });
  }

  await sendDunningMessage(
    subscription.customerPhone,
    subscription.tenant.name,
    updateUrl
  ).catch((e) => console.error("[Admin Dunning] WhatsApp hatası:", e));

  return NextResponse.json({
    ok: true,
    attemptNumber: nextAttemptNumber,
    sentTo: subscription.customerEmail,
  });
}
