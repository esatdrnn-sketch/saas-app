import { buildUpdatePaymentUrl } from "@/lib/app-url";

function buildDunningMessage(
  businessName: string,
  updateUrl: string
): string {
  return `Merhaba ${businessName}, abonelik ödemeniz alınamadı. Hizmetinizin kesintisiz devam etmesi için lütfen 1 dakika içinde kart bilgilerinizi güncelleyin: ${updateUrl}`;
}

/**
 * Gerçek WhatsApp API'sine (Twilio/Meta/local gateway) hazır mock gönderim katmanı.
 * Bu aşamada yalnızca terminale mesaj basar.
 */
export async function sendDunningMessage(
  phone: string,
  businessName: string,
  updateUrl: string
): Promise<void> {
  const message = buildDunningMessage(businessName, updateUrl);
  console.log(
    `🤖 [WhatsApp Bot] -> ${phone} numarasına mesaj gönderildi:\n${message}`
  );
}

// Eski akışlarla geriye dönük uyumluluk için bırakıldı.
export async function sendPaymentFailureNotification(
  phone: string,
  updateToken: string
): Promise<void> {
  const updateUrl = buildUpdatePaymentUrl(updateToken);
  await sendDunningMessage(phone, "Müşterimiz", updateUrl);
}
