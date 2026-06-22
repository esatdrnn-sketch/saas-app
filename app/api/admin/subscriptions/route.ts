import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get("admin_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = (await req.json()) as {
    tenantId?: string;
    customerPhone?: string;
    customerEmail?: string;
    planName?: string;
    amount?: number;
    currency?: string;
    iyzicoSubRef?: string;
  };

  const { tenantId, customerPhone, customerEmail, planName, amount, currency, iyzicoSubRef } = body;

  if (!tenantId || !customerPhone) {
    return NextResponse.json(
      { error: "tenantId ve customerPhone zorunlu." },
      { status: 400 }
    );
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant bulunamadı." }, { status: 404 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      tenantId,
      customerPhone,
      customerEmail: customerEmail || null,
      planName: planName || null,
      amount: amount ? Number(amount) : null,
      currency: currency || "TRY",
      iyzicoSubRef: iyzicoSubRef || null,
    },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}
