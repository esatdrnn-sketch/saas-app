import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { CancelReason } from "@prisma/client";

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

  const configs = await prisma.tenantSurveyConfig.findMany({ where: { tenantId } });
  return NextResponse.json({ configs });
}

type SurveyInput = { reason: CancelReason; label: string; description: string };

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { tenantId, configs } = (await req.json()) as {
    tenantId?: string;
    configs?: SurveyInput[];
  };
  if (!tenantId || !Array.isArray(configs)) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  for (const c of configs) {
    if (!c.label.trim()) {
      await prisma.tenantSurveyConfig.deleteMany({ where: { tenantId, reason: c.reason } });
    } else {
      await prisma.tenantSurveyConfig.upsert({
        where: { tenantId_reason: { tenantId, reason: c.reason } },
        update: { label: c.label.trim(), description: c.description.trim() },
        create: { tenantId, reason: c.reason, label: c.label.trim(), description: c.description.trim() },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
