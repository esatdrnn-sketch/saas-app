import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { generatePortalCode } from "@/lib/app-url";

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

  const body = (await req.json()) as {
    tenantId?: string;
    customerPhone?: string;
    customerEmail?: string;
    planName?: string;
    amount?: number;
    currency?: string;
    iyzicoSubRef?: string;
  };

  const { tenantId, customerPhone: rawPhone, customerEmail, planName, amount, currency, iyzicoSubRef } = body;

  if (!tenantId || !rawPhone) {
    return NextResponse.json(
      { error: "tenantId ve customerPhone zorunlu." },
      { status: 400 }
    );
  }

  // Telefonu E.164 formatına çevir: 05xx → +905xx
  let customerPhone = rawPhone.replace(/\s/g, "");
  if (customerPhone.startsWith("0") && customerPhone.length === 11) customerPhone = "+90" + customerPhone.slice(1);
  if (!customerPhone.startsWith("+")) customerPhone = "+" + customerPhone;

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
      portalCode: generatePortalCode(),
    },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}
