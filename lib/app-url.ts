/** Custom domain öncelikli; yoksa Vercel deployment URL; local'de localhost. */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function buildUpdatePaymentUrl(token: string): string {
  return `${getAppUrl()}/update-payment?token=${encodeURIComponent(token)}`;
}

export function buildPortalUrl(token: string, autoOffer?: "discount" | "pause"): string {
  const base = `${getAppUrl()}/?token=${encodeURIComponent(token)}`;
  return autoOffer ? `${base}&autoOffer=${autoOffer}` : base;
}

export function buildShortPortalUrl(portalCode: string): string {
  return `${getAppUrl()}/go/${portalCode}`;
}

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generatePortalCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
