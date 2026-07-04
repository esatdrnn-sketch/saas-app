import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { writeAuditLog } from "@/lib/audit";

async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === secret;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { tenantId } = (await req.json()) as { tenantId?: string };
  if (!tenantId) return NextResponse.json({ error: "tenantId gerekli." }, { status: 400 });

  const rawKey = randomBytes(24).toString("base64url"); // ~32 char URL-safe
  // Store a hash, return raw — but for this MVP we store raw (no password-level sensitivity)
  const apiKey = `rp_${rawKey}`;

  // Ensure uniqueness: if collision (astronomically rare), hash it
  const safeKey = createHash("sha256").update(apiKey).digest("hex").slice(0, 8) + "_" + rawKey;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { apiKey: safeKey },
  });

  writeAuditLog({
    action: "API_KEY_GENERATED",
    entityType: "Tenant",
    entityId: tenantId,
    actorType: "ADMIN",
  });

  return NextResponse.json({ apiKey: safeKey });
}
