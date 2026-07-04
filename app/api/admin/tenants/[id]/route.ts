import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    webhookUrl?: string;
    slackWebhookUrl?: string;
    notificationEmail?: string;
    brandColor?: string;
    logoUrl?: string;
    portalTitle?: string;
    winbackDays?: number;
    iyzicoApiKey?: string;
    iyzicoSecretKey?: string;
    iyzicoBaseUrl?: string;
  };

  const data: Record<string, unknown> = {};
  if (body.name !== undefined)              data.name              = body.name.trim();
  if (body.webhookUrl !== undefined)        data.webhookUrl        = body.webhookUrl.trim() || null;
  if (body.slackWebhookUrl !== undefined)   data.slackWebhookUrl   = body.slackWebhookUrl.trim() || null;
  if (body.notificationEmail !== undefined) data.notificationEmail = body.notificationEmail.trim() || null;
  if (body.brandColor !== undefined)        data.brandColor        = body.brandColor.trim() || null;
  if (body.logoUrl !== undefined)           data.logoUrl           = body.logoUrl.trim() || null;
  if (body.portalTitle !== undefined)       data.portalTitle       = body.portalTitle.trim() || null;
  if (body.winbackDays !== undefined)       data.winbackDays       = Number(body.winbackDays);
  if (body.iyzicoApiKey !== undefined)      data.iyzicoApiKey      = body.iyzicoApiKey.trim() || null;
  if (body.iyzicoSecretKey !== undefined)   data.iyzicoSecretKey   = body.iyzicoSecretKey.trim() || null;
  if (body.iyzicoBaseUrl !== undefined)     data.iyzicoBaseUrl     = body.iyzicoBaseUrl.trim() || null;

  const tenant = await prisma.tenant.update({ where: { id }, data });
  return NextResponse.json({ tenant });
}
