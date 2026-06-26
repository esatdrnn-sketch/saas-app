import { prisma } from "./prisma";

export type AuditAction =
  | "SUBSCRIPTION_STATUS_CHANGED"
  | "SUBSCRIPTION_DELETED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_REACTIVATED"
  | "CANCEL_FLOW_COMPLETED"
  | "API_KEY_GENERATED"
  | "TENANT_UPDATED"
  | "DUNNING_RESET";

export function writeAuditLog(opts: {
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorType?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}): void {
  void prisma.auditLog.create({
    data: {
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId,
      actorType: opts.actorType ?? "SYSTEM",
      actorId: opts.actorId ?? null,
      metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
    },
  }).catch((err) => console.error("[AuditLog]", err));
}
