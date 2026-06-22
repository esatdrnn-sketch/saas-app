import { createHmac, randomUUID } from "crypto";

interface UpdateCardInput {
  subscriptionReferenceCode: string;
  cardNumber: string;
  expiry: string; // "MM/YY"
  cvc: string;
  holderName: string;
}

function buildAuthHeader(
  apiKey: string,
  secretKey: string,
  body: string
): string {
  const randomKey = randomUUID().replace(/-/g, "");
  // iyzico v2 imza: HMAC-SHA256(secretKey, secretKey + randomKey + body)
  const pki = secretKey + randomKey + body;
  const signature = createHmac("sha256", secretKey)
    .update(pki)
    .digest("base64");
  return `IYZWSv2 apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
}

export async function updateSubscriptionCard(
  input: UpdateCardInput
): Promise<{ success: true }> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl =
    process.env.IYZICO_BASE_URL ?? "https://sandbox.iyzipay.com";

  if (!apiKey || !secretKey) {
    throw new Error("iyzico API anahtarları yapılandırılmamış.");
  }

  const [expireMonth, expireYear] = input.expiry.split("/");

  const requestBody = {
    locale: "tr",
    conversationId: randomUUID(),
    subscriptionReferenceCode: input.subscriptionReferenceCode,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/webhooks/iyzico`,
    cardHolderName: input.holderName,
    cardNumber: input.cardNumber,
    expireMonth: expireMonth,
    expireYear: `20${expireYear}`,
    cvc: input.cvc,
  };

  const bodyStr = JSON.stringify(requestBody);
  const authHeader = buildAuthHeader(apiKey, secretKey, bodyStr);

  const res = await fetch(
    `${baseUrl}/v2/subscription/card-update/checkoutform/initialize`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyStr,
    }
  );

  const data = (await res.json().catch(() => null)) as {
    status?: string;
    errorMessage?: string;
    errorCode?: string;
  } | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      data?.errorMessage ??
        `iyzico kart güncelleme başarısız (HTTP ${res.status}).`
    );
  }

  return { success: true };
}
