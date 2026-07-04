import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createHash } from "crypto";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password + process.env.ADMIN_SESSION_SECRET).digest("hex");
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  const where = tenantId ? { tenantId } : {};
  const users = await prisma.tenantUser.findMany({
    where,
    select: { id: true, tenantId: true, name: true, email: true, createdAt: true, tenant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { tenantId, name, email, password } = (await req.json()) as {
    tenantId?: string; name?: string; email?: string; password?: string;
  };

  if (!tenantId || !name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
  }

  const user = await prisma.tenantUser.create({
    data: {
      tenantId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
    },
    select: { id: true, name: true, email: true, tenantId: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });

  await prisma.tenantUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
