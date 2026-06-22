import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { name } = (await req.json()) as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Tenant adı zorunlu." }, { status: 400 });
  }

  const tenant = await prisma.tenant.create({ data: { name: name.trim() } });
  return NextResponse.json({ tenant }, { status: 201 });
}
