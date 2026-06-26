import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { writeAuditLog } from "@/lib/audit";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

const VALID_STATUSES = ["ACTIVE", "PAST_DUE", "RECOVERED", "PAUSED", "CANCELLED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string };

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  const current = await prisma.subscription.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const updated = await prisma.subscription.update({
    where: { id },
    data: { status: body.status as "ACTIVE" | "PAST_DUE" | "RECOVERED" | "PAUSED" | "CANCELLED" },
    select: { status: true },
  });

  writeAuditLog({
    action: "SUBSCRIPTION_STATUS_CHANGED",
    entityType: "Subscription",
    entityId: id,
    actorType: "ADMIN",
    metadata: { from: current.status, to: body.status },
  });

  return NextResponse.json({ status: updated.status });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;

  await prisma.dunningAttempt.deleteMany({ where: { subscriptionId: id } });
  await prisma.whatsAppSession.deleteMany({ where: { subscriptionId: id } });

  writeAuditLog({
    action: "DUNNING_RESET",
    entityType: "Subscription",
    entityId: id,
    actorType: "ADMIN",
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;

  await prisma.subscription.delete({ where: { id } });

  writeAuditLog({
    action: "SUBSCRIPTION_DELETED",
    entityType: "Subscription",
    entityId: id,
    actorType: "ADMIN",
  });

  return NextResponse.json({ ok: true });
}
