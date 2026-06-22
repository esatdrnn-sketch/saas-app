import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || store.get("admin_session")?.value !== secret) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const tenants = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ tenants });
}
