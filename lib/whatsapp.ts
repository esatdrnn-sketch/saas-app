import { buildPortalUrl, buildUpdatePaymentUrl } from "@/lib/app-url";

// ─── Twilio client ────────────────────────────────────────────────────────────

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Twilio = require("twilio");
  return Twilio(accountSid, authToken) as ReturnType<typeof import("twilio")>;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (!digits.startsWith("+")) return `+${digits}`;
  return phone;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const normalized = normalizePhone(to);
  const client = getTwilioClient();

  if (!client) {
    console.log(`[WhatsApp Mock] → ${normalized}\n${body}`);
    return;
  }

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (!whatsappFrom) {
    console.error(`[Twilio] TWILIO_WHATSAPP_FROM tanımlı değil.`);
    return;
  }

  await client.messages.create({
    from: whatsappFrom.startsWith("whatsapp:") ? whatsappFrom : `whatsapp:${whatsappFrom}`,
    to:   `whatsapp:${normalized}`,
    body,
  });
  console.log(`[WhatsApp] Gönderildi → ${normalized}`);
}

// ─── İlk dunning mesajı (yeni akış) ─────────────────────────────────────────

export async function sendDunningMessage(
  phone: string,
  businessName: string,
  updateToken: string
): Promise<void> {
  const portalUrl = buildPortalUrl(updateToken);
  const body =
    `Merhaba! *${businessName}* ödeme destek ekibinden yazıyoruz.\n` +
    `Abonelik ödemeniz alınamadı — endişelenmeyin, birlikte çözelim.\n\n` +
    `1️⃣ Kartımı güncelleyeyim\n` +
    `2️⃣ Çok pahalıya geliyor\n` +
    `3️⃣ Şimdilik ihtiyacım yok\n` +
    `4️⃣ Teknik sorun var\n` +
    `5️⃣ Ödeme tarihi maaş günüme uymuyor\n\n` +
    `Seçiminizi yazın (1-5) ya da doğrudan yönetim sayfasına gidin:\n🔗 ${portalUrl}`;
  await sendWhatsApp(phone, body);
}

// ─── Konuşma adımı mesajları ─────────────────────────────────────────────────

export async function sendCardUpdateLink(phone: string, updateToken: string): Promise<void> {
  const url  = buildUpdatePaymentUrl(updateToken);
  const body = `Kartınızı güncellemek için:\n🔗 ${url}\n\nGüncelleme tamamlandığında aboneliğiniz otomatik olarak devam eder.`;
  await sendWhatsApp(phone, body);
}

export async function sendDiscountOffer(
  phone: string,
  businessName: string,
  discountPct: number
): Promise<void> {
  const body =
    `Anlıyoruz. *${businessName}* olarak size özel *%${discountPct} indirim* sunmak istiyoruz — 3 ay geçerli.\n\n` +
    `1️⃣ Evet, indirimi kabul ediyorum\n` +
    `2️⃣ Hayır, yine de iptal etmek istiyorum`;
  await sendWhatsApp(phone, body);
}

export async function sendDiscountLink(phone: string, updateToken: string): Promise<void> {
  const url  = buildPortalUrl(updateToken, "discount");
  const body = `Harika! İndirimli fiyatınızı aktif etmek için:\n🔗 ${url}`;
  await sendWhatsApp(phone, body);
}

export async function sendSalaryDatePauseOffer(phone: string, businessName: string): Promise<void> {
  const body =
    `Anlıyoruz, bu çok yaygın bir durum. *${businessName}* aboneliğinizi maaş gününüze kadar donduralım — para gelince otomatik devam eder, hiçbir şey kaybetmezsiniz.\n\n` +
    `1️⃣ Evet, dondurun\n` +
    `2️⃣ Hayır, iptal etmek istiyorum`;
  await sendWhatsApp(phone, body);
}

export async function sendPauseOffer(phone: string, businessName: string): Promise<void> {
  const body =
    `*${businessName}* aboneliğinizi 1 ay donduralım mı? Hazır olunca otomatik devam eder.\n\n` +
    `1️⃣ Evet, dondurun\n` +
    `2️⃣ Hayır, iptal etmek istiyorum`;
  await sendWhatsApp(phone, body);
}

export async function sendPauseLink(phone: string, updateToken: string): Promise<void> {
  const url  = buildPortalUrl(updateToken, "pause");
  const body = `Aboneliğiniz dondurulacak. Onaylamak için:\n🔗 ${url}`;
  await sendWhatsApp(phone, body);
}

export async function sendCancelLink(phone: string, updateToken: string): Promise<void> {
  const url  = buildPortalUrl(updateToken);
  const body = `İptal işlemi için:\n🔗 ${url}`;
  await sendWhatsApp(phone, body);
}

export async function sendTechnicalSupportMessage(
  phone: string,
  updateToken: string
): Promise<void> {
  const url  = buildUpdatePaymentUrl(updateToken);
  const body =
    `Özür dileriz! Teknik sorununuz için destek ekibimiz size yardımcı olmak ister.\n\n` +
    `Bu arada kartınızı güncellemeniz gerekiyorsa:\n🔗 ${url}`;
  await sendWhatsApp(phone, body);
}


// ─── Eski uyumluluk (dunning cron tarafından çağrılıyor) ──────────────────────

export async function sendPaymentFailureNotification(
  phone: string,
  updateToken: string
): Promise<void> {
  const url = buildUpdatePaymentUrl(updateToken);
  await sendDunningMessage(phone, "Müşterimiz", url);
}
