import { createHmac, timingSafeEqual } from "crypto";

export type IyzicoWebhookEvent = "payment.failed" | "payment.success";

export interface ParsedIyzicoWebhook {
  event: IyzicoWebhookEvent;
  subscriptionReferenceCode: string;
}

export function verifyIyzicoWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.IYZICO_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function parseIyzicoWebhook(body: unknown): ParsedIyzicoWebhook | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const subscriptionReferenceCode = payload.subscriptionReferenceCode;

  if (typeof subscriptionReferenceCode !== "string" || !subscriptionReferenceCode) {
    return null;
  }

  const eventValue = payload.event ?? payload.type ?? payload.status;

  if (eventValue === "payment.failed" || eventValue === "FAILURE") {
    return { event: "payment.failed", subscriptionReferenceCode };
  }

  if (eventValue === "payment.success" || eventValue === "SUCCESS") {
    return { event: "payment.success", subscriptionReferenceCode };
  }

  return null;
}
