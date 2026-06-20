/** Vercel'de otomatik VERCEL_URL; local'de localhost. */
export function getAppUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function buildUpdatePaymentUrl(token: string): string {
  return `${getAppUrl()}/update-payment?token=${encodeURIComponent(token)}`;
}
