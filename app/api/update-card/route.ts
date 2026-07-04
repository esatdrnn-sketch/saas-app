import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initSubscriptionCardUpdate } from "@/lib/iyzico";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Token eksik." }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    select: {
      id: true, iyzicoSubRef: true, status: true,
      tenant: { select: { iyzicoApiKey: true, iyzicoSecretKey: true, iyzicoBaseUrl: true } },
    },
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const isTestMode = subscription.iyzicoSubRef === "test-mode";

  if (isTestMode) {
    return NextResponse.json({ checkoutUrl: "/test-card-update" });
  }

  const tenantCreds = subscription.tenant.iyzicoApiKey && subscription.tenant.iyzicoSecretKey
    ? { apiKey: subscription.tenant.iyzicoApiKey, secretKey: subscription.tenant.iyzicoSecretKey, baseUrl: subscription.tenant.iyzicoBaseUrl ?? undefined }
    : undefined;

  try {
    const { checkoutUrl } = await initSubscriptionCardUpdate({
      subscriptionReferenceCode: subscription.iyzicoSubRef,
      callbackUrl: `${appUrl}/card-updated?token=${encodeURIComponent(token)}`,
    }, tenantCreds);
    return NextResponse.json({ checkoutUrl });
  } catch {
    return NextResponse.json({ checkoutUrl: `/test-card-update?token=${encodeURIComponent(token)}` });
  }
}
