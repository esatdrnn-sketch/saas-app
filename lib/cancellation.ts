import type { CancelOutcome, CancelReason } from "@prisma/client";

export const CANCEL_REASON_LABELS: Record<CancelReason, string> = {
  TOO_EXPENSIVE: "Çok pahalı",
  TECHNICAL: "Teknik sorunlar yaşıyorum",
  TEMPORARY: "Geçici olarak ihtiyacım yok",
  ALTERNATIVE: "Başka bir alternatif buldum",
};

export const CANCEL_REASON_ORDER: CancelReason[] = [
  "TOO_EXPENSIVE",
  "TECHNICAL",
  "TEMPORARY",
  "ALTERNATIVE",
];

export type CancelReasonInput =
  | "too_expensive"
  | "technical"
  | "temporary"
  | "alternative";

export type CancelActionInput = "accept_discount" | "accept_pause" | "cancel";

const REASON_MAP: Record<CancelReasonInput, CancelReason> = {
  too_expensive: "TOO_EXPENSIVE",
  technical: "TECHNICAL",
  temporary: "TEMPORARY",
  alternative: "ALTERNATIVE",
};

const ACTION_MAP: Record<CancelActionInput, CancelOutcome> = {
  accept_discount: "ACCEPT_DISCOUNT",
  accept_pause: "ACCEPT_PAUSE",
  cancel: "CANCEL",
};

export function parseCancelReason(value: string): CancelReason | null {
  return REASON_MAP[value as CancelReasonInput] ?? null;
}

export function parseCancelAction(value: string): CancelOutcome | null {
  return ACTION_MAP[value as CancelActionInput] ?? null;
}
