import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      actorType: true,
      metadata: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ logs });
}
