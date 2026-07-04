import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId gerekli." }, { status: 400 });

  const config = await prisma.tenantEmailConfig.findUnique({ where: { tenantId } });
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = (await req.json()) as {
    tenantId?: string;
    fromName?: string;
    replyTo?: string;
    footerNote?: string;
  };

  if (!body.tenantId) return NextResponse.json({ error: "tenantId gerekli." }, { status: 400 });

  const config = await prisma.tenantEmailConfig.upsert({
    where: { tenantId: body.tenantId },
    create: {
      tenantId: body.tenantId,
      fromName:   body.fromName   || null,
      replyTo:    body.replyTo    || null,
      footerNote: body.footerNote || null,
    },
    update: {
      fromName:   body.fromName   !== undefined ? body.fromName   || null : undefined,
      replyTo:    body.replyTo    !== undefined ? body.replyTo    || null : undefined,
      footerNote: body.footerNote !== undefined ? body.footerNote || null : undefined,
    },
  });

  return NextResponse.json({ config });
}
