import { buildUpdatePaymentUrl } from "@/lib/app-url";

function buildDunningMessage(businessName: string, updateUrl: string): string {
  return (
    `Merhaba! *${businessName}* aboneliğinizin ödemesi alınamadı.\n\n` +
    `Hizmetinizin kesintisiz devam etmesi için lütfen kart bilgilerinizi güncelleyin:\n` +
    `${updateUrl}\n\n` +
    `Yardım için bu mesaja yanıt verebilirsiniz.`
  );
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Twilio = require("twilio");
  return Twilio(accountSid, authToken) as ReturnType<typeof import("twilio")>;
}

function normalizePhone(phone: string): string {
  // Türk numaraları: 05551234567 → +905551234567
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return `+9${digits}`;
  }
  if (!digits.startsWith("+")) {
    return `+${digits}`;
  }
  return phone;
}

export async function sendDunningMessage(
  phone: string,
  businessName: string,
  updateUrl: string
): Promise<void> {
  const message = buildDunningMessage(businessName, updateUrl);
  const to = normalizePhone(phone);
  const client = getTwilioClient();

  if (!client) {
    // Twilio yapılandırılmamış → geliştirme mock'u
    console.log(`[WhatsApp Mock] → ${to}\n${message}`);
    return;
  }

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const smsFrom = process.env.TWILIO_SMS_FROM;

  // 1. WhatsApp dene
  if (whatsappFrom) {
    try {
      await client.messages.create({
        from: whatsappFrom.startsWith("whatsapp:")
          ? whatsappFrom
          : `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${to}`,
        body: message,
      });
      console.log(`[WhatsApp] Gönderildi → ${to}`);
      return;
    } catch (err) {
      console.warn(`[WhatsApp] Gönderim başarısız, SMS'e düşülüyor:`, err);
    }
  }

  // 2. SMS fallback
  if (smsFrom) {
    await client.messages.create({
      from: smsFrom,
      to,
      body: message,
    });
    console.log(`[SMS] Gönderildi → ${to}`);
    return;
  }

  console.error(`[Twilio] TWILIO_WHATSAPP_FROM ve TWILIO_SMS_FROM ikisi de tanımlı değil.`);
}

export async function sendPaymentFailureNotification(
  phone: string,
  updateToken: string
): Promise<void> {
  const updateUrl = buildUpdatePaymentUrl(updateToken);
  await sendDunningMessage(phone, "Müşterimiz", updateUrl);
}
