// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay");
import { randomUUID } from "crypto";

interface UpdateCardInput {
  subscriptionReferenceCode: string;
  cardNumber: string;
  expiry: string; // "MM/YY"
  cvc: string;
  holderName: string;
}

function getClient() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL ?? "https://sandbox.iyzipay.com",
  });
}

export async function updateSubscriptionCard(
  input: UpdateCardInput
): Promise<{ success: true }> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("iyzico API anahtarları yapılandırılmamış.");
  }

  const [expireMonth, expireYear] = input.expiry.split("/");

  const iyzipay = getClient();

  return new Promise((resolve, reject) => {
    iyzipay.subscriptionCardUpdate.initialize(
      {
        locale: "tr",
        conversationId: randomUUID(),
        subscriptionReferenceCode: input.subscriptionReferenceCode,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/webhooks/iyzico`,
        cardHolderName: input.holderName,
        cardNumber: input.cardNumber,
        expireMonth: expireMonth,
        expireYear: `20${expireYear}`,
        cvc: input.cvc,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: Error | null, result: any) => {
        if (err) {
          reject(new Error(err.message ?? "iyzico bağlantı hatası."));
          return;
        }
        if (result?.status !== "success") {
          reject(
            new Error(
              result?.errorMessage ?? "Kart güncelleme başarısız oldu."
            )
          );
          return;
        }
        resolve({ success: true });
      }
    );
  });
}
