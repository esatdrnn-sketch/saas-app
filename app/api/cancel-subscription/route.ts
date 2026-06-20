import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCancelAction, parseCancelReason } from "@/lib/cancellation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = body?.token as string | undefined;
    const actionInput = body?.action as string | undefined;
    const reasonInput = body?.reason as string | undefined;

    const action = actionInput ? parseCancelAction(actionInput) : null;
    const reason = reasonInput ? parseCancelReason(reasonInput) : null;

    if (!token || !action || !reason) {
      return NextResponse.json(
        { error: "Geçersiz istek." },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { updateToken: token },
      select: { id: true, status: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş bağlantı." },
        { status: 404 }
      );
    }

    if (subscription.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Bu abonelik zaten iptal edilmiş." },
        { status: 400 }
      );
    }

    const statusByAction = {
      ACCEPT_DISCOUNT: "ACTIVE",
      ACCEPT_PAUSE: "PAUSED",
      CANCEL: "CANCELLED",
    } as const;

    // Neon HTTP adapter does not support prisma.$transaction — run sequentially.
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: statusByAction[action] },
      select: { status: true },
    });

    await prisma.cancellationEvent.create({
      data: {
        subscriptionId: subscription.id,
        reason,
        action,
      },
    });

    return NextResponse.json({ status: updated.status, action: actionInput });
  } catch (error) {
    console.error("[cancel-subscription]", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
