import { createHash, timingSafeEqual } from "crypto";

// iyzico abonelik webhook event tipleri
export type IyzicoWebhookEvent = "payment.failed" | "payment.success";

export interface ParsedIyzicoWebhook {
  event: IyzicoWebhookEvent;
  subscriptionReferenceCode: string;
  iyziReferenceCode: string;
  iyziEventType: string;
}

export interface IyzicoRawPayload {
  iyziEventType?: string;
  iyziEventTime?: number;
  iyziReferenceCode?: string;
  iyziSignature?: string;
  status?: string;
  subscriptionReferenceCode?: string;
  [key: string]: unknown;
}

/**
 * iyzico webhook imza doğrulama.
 * Algoritma: base64( SHA-1( secretKey + iyziReferenceCode + iyziEventType ) )
 * Kaynak: https://dev.iyzipay.com/tr/webhook
 */
export function verifyIyzicoWebhookSignature(
  payload: IyzicoRawPayload,
  secretKey: string
): boolean {
  const { iyziSignature, iyziReferenceCode, iyziEventType } = payload;

  if (!iyziSignature || !iyziReferenceCode || !iyziEventType) {
    return false;
  }

  const raw = secretKey + iyziReferenceCode + iyziEventType;
  const expected = Buffer.from(
    createHash("sha1").update(raw).digest()
  ).toString("base64");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(iyziSignature);

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, receivedBuf);
}

const FAILURE_EVENTS = new Set([
  "SUBSCRIPTION_ORDER_FAILURE",
  "SUBSCRIPTION_PAYMENT_RETRY_FAILURE",
  "payment.failed",
  "FAILURE",
]);

const SUCCESS_EVENTS = new Set([
  "SUBSCRIPTION_ORDER_SUCCESS",
  "SUBSCRIPTION_PAYMENT_SUCCESS",
  "payment.success",
  "SUCCESS",
]);

export function parseIyzicoWebhook(
  body: unknown
): ParsedIyzicoWebhook | null {
  if (!body || typeof body !== "object") return null;

  const p = body as IyzicoRawPayload;

  const subscriptionReferenceCode = p.subscriptionReferenceCode;
  const iyziReferenceCode = p.iyziReferenceCode;
  const iyziEventType = p.iyziEventType ?? p.status;

  if (
    typeof subscriptionReferenceCode !== "string" ||
    !subscriptionReferenceCode ||
    typeof iyziReferenceCode !== "string" ||
    !iyziReferenceCode ||
    typeof iyziEventType !== "string" ||
    !iyziEventType
  ) {
    return null;
  }

  if (FAILURE_EVENTS.has(iyziEventType)) {
    return {
      event: "payment.failed",
      subscriptionReferenceCode,
      iyziReferenceCode,
      iyziEventType,
    };
  }

  if (SUCCESS_EVENTS.has(iyziEventType)) {
    return {
      event: "payment.success",
      subscriptionReferenceCode,
      iyziReferenceCode,
      iyziEventType,
    };
  }

  return null;
}
