import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "API anahtarı gerekli." }, { status: 401 });
  }

  const apiKey = auth.slice(7).trim();
  const tenant = await prisma.tenant.findUnique({
    where: { apiKey },
    select: { id: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Geçersiz API anahtarı." }, { status: 401 });
  }

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50"), 200);
  const skip = (page - 1) * limit;
  const status = req.nextUrl.searchParams.get("status");

  const where = {
    tenantId: tenant.id,
    ...(status ? { status: status as "ACTIVE" | "PAST_DUE" | "RECOVERED" | "PAUSED" | "CANCELLED" } : {}),
  };

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        customerPhone: true,
        customerEmail: true,
        planName: true,
        amount: true,
        currency: true,
        status: true,
        pauseUntil: true,
        winbackSentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return NextResponse.json({ subscriptions, total, page, limit });
}
