import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId gerekli." }, { status: 400 });

  const items = await prisma.tenantTestimonial.findMany({
    where: { tenantId },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = (await req.json()) as {
    tenantId?: string;
    customerName?: string;
    role?: string;
    quote?: string;
    displayOrder?: number;
  };

  if (!body.tenantId || !body.customerName || !body.quote) {
    return NextResponse.json({ error: "tenantId, customerName, quote zorunlu." }, { status: 400 });
  }

  const item = await prisma.tenantTestimonial.create({
    data: {
      tenantId:     body.tenantId,
      customerName: body.customerName,
      role:         body.role || null,
      quote:        body.quote,
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });

  await prisma.tenantTestimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
