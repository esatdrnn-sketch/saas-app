import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + process.env.ADMIN_SESSION_SECRET).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { loginKey?: string; email?: string; password?: string };

  // ── email + password girişi (Low 10) ─────────────────────────────────────
  if (body.email && body.password) {
    const user = await prisma.tenantUser.findFirst({
      where: { email: body.email.trim().toLowerCase() },
      select: { id: true, tenantId: true, passwordHash: true },
    });

    if (!user || user.passwordHash !== hashPassword(body.password)) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    const store = await cookies();
    store.set("tenant_session", user.tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  // ── loginKey girişi (mevcut) ──────────────────────────────────────────────
  const loginKey = body.loginKey;
  if (!loginKey || typeof loginKey !== "string") {
    return NextResponse.json({ error: "Giriş anahtarı veya e-posta/şifre gerekli." }, { status: 400 });
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
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ ok: true, tenantName: tenant.name });
}
