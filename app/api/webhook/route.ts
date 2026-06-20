import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailureNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // iyzico başarısız ödeme event'i: status === "FAILURE"
  if (body?.status !== "FAILURE") {
    return NextResponse.json({ received: true });
  }

  const iyzicoSubRef = body?.subscriptionReferenceCode as string | undefined;

  if (!iyzicoSubRef) {
    return NextResponse.json(
      { error: "subscriptionReferenceCode eksik" },
      { status: 400 }
    );
  }

  const subscription = await prisma.subscription.findFirst({
    where: { iyzicoSubRef },
    select: { id: true, customerPhone: true, updateToken: true },
  });

  if (!subscription) {
    console.log(`[Webhook] Abonelik bulunamadı: ${iyzicoSubRef}`);
    return NextResponse.json({ received: true });
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "PAST_DUE" },
  });

  await sendPaymentFailureNotification(
    subscription.customerPhone,
    subscription.updateToken
  );

  return NextResponse.json({ received: true });
}
