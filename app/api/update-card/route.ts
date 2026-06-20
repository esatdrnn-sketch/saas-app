import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSubscriptionCard } from "@/lib/iyzico";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const token = body?.token as string | undefined;
  const cardNumber = (body?.cardNumber as string | undefined)?.replace(/\s/g, "");
  const expiry = body?.expiry as string | undefined;
  const cvc = body?.cvc as string | undefined;
  const holderName = body?.holderName as string | undefined;

  if (!token || !cardNumber || !expiry || !cvc || !holderName) {
    return NextResponse.json(
      { error: "Eksik alanlar var." },
      { status: 400 }
    );
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    return NextResponse.json(
      { error: "Geçersiz kart numarası." },
      { status: 400 }
    );
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return NextResponse.json(
      { error: "Geçersiz son kullanma tarihi." },
      { status: 400 }
    );
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    return NextResponse.json(
      { error: "Geçersiz CVC." },
      { status: 400 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    select: { id: true, iyzicoSubRef: true, status: true },
  });

  if (!subscription) {
    return NextResponse.json(
      { error: "Geçersiz veya süresi dolmuş bağlantı." },
      { status: 404 }
    );
  }

  if (subscription.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Bu abonelik iptal edilmiş." },
      { status: 400 }
    );
  }

  if (!subscription.iyzicoSubRef) {
    return NextResponse.json(
      { error: "Abonelik referans kodu bulunamadı." },
      { status: 400 }
    );
  }

  await updateSubscriptionCard({
    subscriptionReferenceCode: subscription.iyzicoSubRef,
    cardNumber,
    expiry,
    cvc,
    holderName,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "RECOVERED" },
  });

  return NextResponse.json({ success: true });
}
