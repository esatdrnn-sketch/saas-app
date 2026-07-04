import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

function escapeCSV(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { select: { name: true } },
      dunningAttempts: { orderBy: { attemptNumber: "desc" }, take: 1 },
      cancellationEvents: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const headers = [
    "ID", "Tenant", "Müşteri Telefon", "Müşteri Email",
    "Plan", "Tutar", "Para Birimi", "Durum",
    "Dunning Denemesi", "İptal Nedeni", "Pause Bitiş",
    "Oluşturma Tarihi", "Güncelleme Tarihi",
  ];

  const rows = subscriptions.map((sub) => [
    sub.id,
    sub.tenant.name,
    sub.customerPhone,
    sub.customerEmail ?? "",
    sub.planName ?? "",
    sub.amount ?? "",
    sub.currency,
    sub.status,
    sub.dunningAttempts[0]?.attemptNumber ?? "",
    sub.cancellationEvents[0]?.reason ?? "",
    sub.pauseUntil?.toISOString() ?? "",
    sub.createdAt.toISOString(),
    sub.updatedAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscriptions-${date}.csv"`,
    },
  });
}
