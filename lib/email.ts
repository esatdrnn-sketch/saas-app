import { Resend } from "resend";

// Domain doğrulanmışsa RESEND_FROM set edilir, yoksa Resend test adresi
const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "onboarding@resend.dev";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// ─── HTML Şablonları ──────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RecoverPanel</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">RecoverPanel</span>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Bu e-postayı almak istemiyorsanız aboneliğinizi yönetmek için
              <a href="#" style="color:#4f46e5;">buraya tıklayın</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function attempt1Html(businessName: string, updateUrl: string, plan = ""): string {
  return baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:1px;">Ödeme Bildirimi</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Ödemeniz alınamadı</h1>
    ${plan}
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${businessName}</strong> aboneliğinizin ödemesi gerçekleştirilemedi.
      Hizmetinizin kesintisiz devam etmesi için lütfen kart bilgilerinizi güncelleyin.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#4f46e5;padding:14px 28px;">
          <a href="${updateUrl}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">
            Kart Bilgilerimi Güncelle →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Bu bağlantı güvenlidir ve yalnızca size özeldir.
      Sorun yaşıyorsanız bu e-postaya yanıt verebilirsiniz.
    </p>
  `);
}

function attempt2Html(businessName: string, updateUrl: string, plan = ""): string {
  return baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Hatırlatma</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Aboneliğiniz askıya alınmak üzere</h1>
    ${plan}
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${businessName}</strong> aboneliğinizin ödemesi hâlâ alınamadı.
      Kart bilgilerinizi bugün güncellemezseniz aboneliğiniz <strong>4 gün içinde</strong> askıya alınacak.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f59e0b;padding:14px 28px;">
          <a href="${updateUrl}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">
            Hemen Güncelle →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Bu ikinci hatırlatmamızdır. Sorun yaşıyorsanız bu e-postaya yanıt verin.
    </p>
  `);
}

function attempt3Html(businessName: string, updateUrl: string, plan = ""): string {
  return baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:1px;">Son Uyarı</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Aboneliğiniz bugün iptal ediliyor</h1>
    ${plan}
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${businessName}</strong> aboneliğinize ait ödeme 7 gündür alınamıyor.
      Kart bilgilerinizi <strong>bugün</strong> güncellemezseniz aboneliğiniz kalıcı olarak iptal edilecek
      ve tüm verilerinize erişiminiz kesilecek.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#ef4444;padding:14px 28px;">
          <a href="${updateUrl}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">
            Aboneliğimi Kurtarmak İstiyorum →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Bu son hatırlatmamızdır. Yardım için bu e-postaya yanıt verebilirsiniz.
    </p>
  `);
}

// ─── Gönderim Fonksiyonları ───────────────────────────────────────────────────

export interface DunningEmailInput {
  to: string;
  businessName: string;
  updateUrl: string;
  attemptNumber: 1 | 2 | 3;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
}

function planRow(planName?: string | null, amount?: number | null, currency?: string | null): string {
  if (!planName && !amount) return "";
  const parts: string[] = [];
  if (planName) parts.push(`<strong>${planName}</strong>`);
  if (amount != null) {
    const formatted = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency ?? "TRY",
    }).format(amount);
    parts.push(formatted + " / ay");
  }
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;width:100%;">
      <tr>
        <td style="padding:10px 14px;">
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Abonelik</span>
          <p style="margin:4px 0 0;font-size:15px;color:#0f172a;">${parts.join(" · ")}</p>
        </td>
      </tr>
    </table>`;
}

const SUBJECTS: Record<number, string> = {
  1: "Ödemeniz alınamadı — Kart bilgilerinizi güncelleyin",
  2: "Hatırlatma: Aboneliğiniz askıya alınmak üzere",
  3: "Son uyarı: Aboneliğiniz bugün iptal ediliyor",
};

const TEMPLATES: Record<
  number,
  (businessName: string, updateUrl: string, planName?: string | null, amount?: number | null, currency?: string | null) => string
> = {
  1: (b, u, p, a, c) => attempt1Html(b, u, planRow(p, a, c)),
  2: (b, u, p, a, c) => attempt2Html(b, u, planRow(p, a, c)),
  3: (b, u, p, a, c) => attempt3Html(b, u, planRow(p, a, c)),
};

export async function sendDunningEmail(
  input: DunningEmailInput
): Promise<void> {
  const client = getClient();
  const subject = SUBJECTS[input.attemptNumber];
  const html = TEMPLATES[input.attemptNumber](
    input.businessName,
    input.updateUrl,
    input.planName,
    input.amount,
    input.currency,
  );

  if (!client) {
    console.log(
      `[Email Mock] Deneme ${input.attemptNumber} → ${input.to} | ${subject}`
    );
    return;
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend hatası: ${error.message}`);
  }

  console.log(`[Email] Deneme ${input.attemptNumber} gönderildi → ${input.to}`);
}
