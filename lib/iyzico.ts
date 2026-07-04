import { createHmac } from "crypto";

interface InitCardUpdateInput {
  subscriptionReferenceCode: string;
  callbackUrl: string;
  locale?: string;
  conversationId?: string;
}

export interface InitCardUpdateResult {
  checkoutUrl: string;
}

function generateRandomString(): string {
  return `${process.hrtime ? process.hrtime()[0] : Date.now()}${Math.random().toString(8).slice(2)}`;
}

function buildAuthHeaderV2(
  apiKey: string,
  secretKey: string,
  uri: string,
  randomString: string,
  body: Record<string, unknown>
): string {
  const signature = createHmac("sha256", secretKey)
    .update(randomString + uri + JSON.stringify(body))
    .digest("hex");

  const params = `apiKey:${apiKey}&randomKey:${randomString}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(params).toString("base64")}`;
}

export interface IyzicoCredentials {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
}

function getIyzicoConfig(creds?: IyzicoCredentials) {
  const apiKey    = creds?.apiKey    ?? process.env.IYZICO_API_KEY;
  const secretKey = creds?.secretKey ?? process.env.IYZICO_SECRET_KEY;
  const baseUrl   = creds?.baseUrl   ?? process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
  if (!apiKey || !secretKey) throw new Error("iyzico API anahtarları yapılandırılmamış.");
  return { apiKey, secretKey, baseUrl };
}

async function iyzicoRequest(uri: string, body: Record<string, unknown>, creds?: IyzicoCredentials): Promise<Record<string, unknown>> {
  const { apiKey, secretKey, baseUrl } = getIyzicoConfig(creds);
  const randomString = generateRandomString();
  const authHeader = buildAuthHeaderV2(apiKey, secretKey, uri, randomString, body);

  const res = await fetch(`${baseUrl}${uri}`, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "x-iyzi-rnd": randomString,
      "x-iyzi-client-version": "iyzipay-node-2.0.69",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null) as Record<string, unknown> | null;
  if (!res.ok || !data || data["status"] !== "success") {
    throw new Error(String(data?.["errorMessage"] ?? `iyzico isteği başarısız (HTTP ${res.status}).`));
  }
  return data;
}

export async function initSubscriptionCardUpdate(
  input: InitCardUpdateInput,
  creds?: IyzicoCredentials
): Promise<InitCardUpdateResult> {
  const { apiKey, secretKey, baseUrl } = getIyzicoConfig(creds);
  const uri = "/v2/subscription/card-update/checkoutform/initialize/with-subscription";

  const body: Record<string, unknown> = {
    locale: input.locale ?? "tr",
    conversationId: input.conversationId ?? String(Date.now()),
    subscriptionReferenceCode: input.subscriptionReferenceCode,
    callbackUrl: input.callbackUrl,
  };

  const randomString = generateRandomString();
  const authHeader = buildAuthHeaderV2(apiKey, secretKey, uri, randomString, body);

  const res = await fetch(`${baseUrl}${uri}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "x-iyzi-rnd": randomString,
      "x-iyzi-client-version": "iyzipay-node-2.0.69",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as {
    status?: string;
    payWithIyzicoPageUrl?: string;
    checkoutFormContent?: string;
    errorMessage?: string;
    errorCode?: string;
  } | null;

  if (!res.ok || !data || data.status !== "success") {
    throw new Error(data?.errorMessage ?? `iyzico kart güncelleme başlatma başarısız (HTTP ${res.status}).`);
  }

  const checkoutUrl = data.payWithIyzicoPageUrl;
  if (!checkoutUrl) throw new Error("iyzico'dan yönlendirme URL'i alınamadı.");

  return { checkoutUrl };
}

// ─── Abonelik askıya alma / aktif etme (Medium 8) ────────────────────────────

export async function suspendIyzicoSubscription(subscriptionReferenceCode: string, creds?: IyzicoCredentials): Promise<void> {
  const uri = `/v2/subscription/subscriptions/${subscriptionReferenceCode}/suspend`;
  await iyzicoRequest(uri, { locale: "tr", conversationId: String(Date.now()) }, creds)
    .catch((err) => console.warn("[iyzico] Suspend başarısız:", err));
}

export async function activateIyzicoSubscription(subscriptionReferenceCode: string, creds?: IyzicoCredentials): Promise<void> {
  const uri = `/v2/subscription/subscriptions/${subscriptionReferenceCode}/activate`;
  await iyzicoRequest(uri, { locale: "tr", conversationId: String(Date.now()) }, creds)
    .catch((err) => console.warn("[iyzico] Activate başarısız:", err));
}

export async function upgradeIyzicoSubscription(
  subscriptionReferenceCode: string,
  newPlanReferenceCode: string,
  creds?: IyzicoCredentials
): Promise<void> {
  const uri = `/v2/subscription/subscriptions/${subscriptionReferenceCode}/upgrade`;
  await iyzicoRequest(uri, {
    locale: "tr",
    conversationId: String(Date.now()),
    newSubscriptionPlanReferenceCode: newPlanReferenceCode,
    upgradePeriod: "NOW",
  }, creds).catch((err) => console.warn("[iyzico] Upgrade başarısız:", err));
}
