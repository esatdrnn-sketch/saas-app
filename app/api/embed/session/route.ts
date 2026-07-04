import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { apiKey?: string; customerId?: string } | null;

  if (!body?.apiKey || !body?.customerId) {
    return NextResponse.json({ error: "apiKey ve customerId zorunlu." }, { status: 400, headers: CORS });
  }

  const tenant = await prisma.tenant.findUnique({ where: { apiKey: body.apiKey } });
  if (!tenant) {
    return NextResponse.json({ error: "Geçersiz API anahtarı." }, { status: 401, headers: CORS });
  }

  const id = body.customerId.trim();

  // Telefonu farklı formatlarda dene
  const phoneVariants = [id];
  if (id.startsWith("0") && id.length === 11)   phoneVariants.push("+90" + id.slice(1));
  if (id.startsWith("+90"))                       phoneVariants.push("0"   + id.slice(3));
  if (/^\d{10}$/.test(id))                        phoneVariants.push("+90" + id);

  const subscription = await prisma.subscription.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [
        { customerEmail: id },
        { customerPhone: { in: phoneVariants } },
      ],
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Bu tenant altında abonelik bulunamadı." }, { status: 404, headers: CORS });
  }

  return NextResponse.json({ token: subscription.updateToken }, { headers: CORS });
}
