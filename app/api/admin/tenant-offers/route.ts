import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { CancelReason, OfferType } from "@prisma/client";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId gerekli." }, { status: 400 });
  }

  const offers = await prisma.tenantOffer.findMany({ where: { tenantId } });
  return NextResponse.json({ offers });
}

type OfferInput = {
  reason: CancelReason;
  offerType: OfferType | "NONE";
  value: number | null;
};

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { tenantId, offers } = (await req.json()) as {
    tenantId?: string;
    offers?: OfferInput[];
  };

  if (!tenantId || !Array.isArray(offers)) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  for (const offer of offers) {
    if (offer.offerType === "NONE") {
      await prisma.tenantOffer.deleteMany({
        where: { tenantId, reason: offer.reason },
      });
    } else {
      await prisma.tenantOffer.upsert({
        where: { tenantId_reason: { tenantId, reason: offer.reason } },
        update: { offerType: offer.offerType, value: offer.value },
        create: {
          tenantId,
          reason: offer.reason,
          offerType: offer.offerType,
          value: offer.value,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
