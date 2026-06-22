import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { loginKey } = await req.json();

  if (!loginKey || typeof loginKey !== "string") {
    return NextResponse.json({ error: "Giriş anahtarı gerekli." }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { loginKey: loginKey.trim() },
    select: { id: true, name: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Geçersiz giriş anahtarı." }, { status: 401 });
  }

  const store = await cookies();
  store.set("tenant_session", tenant.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: "/",
  });

  return NextResponse.json({ ok: true, tenantName: tenant.name });
}
