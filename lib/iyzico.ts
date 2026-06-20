interface UpdateCardInput {
  subscriptionReferenceCode: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  holderName: string;
}

/** iyzico kart güncelleme API'sinin mock karşılığı. */
export async function updateSubscriptionCard(
  input: UpdateCardInput
): Promise<{ success: true }> {
  console.log("[iyzico Mock] Kart güncelleniyor:", {
    subscriptionReferenceCode: input.subscriptionReferenceCode,
    holderName: input.holderName,
    expiry: input.expiry,
    cardLast4: input.cardNumber.slice(-4),
  });

  return { success: true };
}
