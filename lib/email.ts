import { Resend } from "resend";

const FROM_ADDRESS = process.env.RESEND_FROM ?? "onboarding@resend.dev";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// ─── Base layout ──────────────────────────────────────────────────────────────

function baseLayout(content: string, accentColor = "#4f46e5", headerName = "Subkoru"): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerName}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:${accentColor};padding:24px 32px;">
            <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">${headerName}</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Bu e-posta ${headerName} tarafından otomatik olarak gönderilmiştir.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

// ─── Dunning emailler (müşteriye) ─────────────────────────────────────────────

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
          <a href="${updateUrl}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Kart Bilgilerimi Güncelle →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Bu bağlantı güvenlidir ve yalnızca size özeldir.</p>
  `, "#4f46e5", businessName);
}

function attempt2Html(
  businessName: string,
  updateUrl: string,
  discountUrl: string,
  pauseUrl: string,
  offerType: "discount" | "pause" | "both",
  plan = "",
): string {
  const discountBlock = `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 10px;">
      <tr>
        <td style="background:#059669;padding:13px 20px;">
          <a href="${discountUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">%30 İndirimi Kabul Et — 3 ay geçerli →</a>
        </td>
      </tr>
    </table>`;
  const pauseBlock = `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 10px;">
      <tr>
        <td style="background:#f59e0b;padding:13px 20px;">
          <a href="${pauseUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Aboneliğimi 30 Gün Dondur →</a>
        </td>
      </tr>
    </table>`;

  const offerBlocks =
    offerType === "discount" ? discountBlock :
    offerType === "pause"    ? pauseBlock :
    discountBlock + pauseBlock;

  return baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Size Özel Teklif</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Aboneliğinizi kurtarmak için teklifimiz var</h1>
    ${plan}
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${businessName}</strong> aboneliğinizin ödemesi hâlâ alınamadı. Aboneliğinizi kaybetmemeniz için size özel seçenekler hazırladık:
    </p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 12px;background:#f0fdf4;border:1px solid #86efac;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;">Kişisel Teklifiniz</p>
        <p style="margin:0;font-size:14px;color:#064e3b;">Ödeme güçlüğü yaşıyorsanız aşağıdaki seçeneklerden birini tek tıkla kullanabilirsiniz.</p>
      </td></tr>
    </table>
    ${offerBlocks}
    <p style="margin:12px 0 20px;font-size:13px;color:#64748b;text-align:center;">— veya —</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td style="border:1.5px solid #4f46e5;padding:12px 20px;text-align:center;">
          <a href="${updateUrl}" style="color:#4f46e5;font-size:14px;font-weight:700;text-decoration:none;">Kart Bilgilerimi Güncelle →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Teklifler yalnızca size özeldir. 4 gün içinde işlem yapılmazsa aboneliğiniz askıya alınacaktır.</p>
  `, "#f59e0b", businessName);
}

function attempt3Html(
  businessName: string,
  updateUrl: string,
  discountUrl: string,
  pauseUrl: string,
  plan = "",
): string {
  return baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:1px;">Son Şans</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Aboneliğiniz bugün sona eriyor — hâlâ kurtarabilirsiniz</h1>
    ${plan}
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${businessName}</strong> aboneliğinize ait ödeme 7 gündür alınamıyor. <strong>Bugün işlem yapmazsanız aboneliğiniz kalıcı olarak iptal edilecek.</strong><br><br>
      Aşağıdaki seçeneklerden biriyle aboneliğinizi kurtarabilirsiniz:
    </p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 10px;">
      <tr>
        <td style="background:#ef4444;padding:13px 20px;">
          <a href="${discountUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">%30 İndirimi Kabul Et →</a>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 10px;">
      <tr>
        <td style="background:#f59e0b;padding:13px 20px;">
          <a href="${pauseUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Aboneliğimi 30 Gün Dondur →</a>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td style="border:1.5px solid #e2e8f0;padding:12px 20px;text-align:center;">
          <a href="${updateUrl}" style="color:#64748b;font-size:13px;font-weight:600;text-decoration:none;">Kart Bilgilerimi Güncelle →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Bu son hatırlatmamızdır.</p>
  `, "#ef4444", businessName);
}

export interface DunningEmailInput {
  to: string;
  businessName: string;
  updateUrl: string;
  attemptNumber: 1 | 2 | 3;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
  discountUrl?: string;
  pauseUrl?: string;
  offerType?: "discount" | "pause" | "both";
}

const DUNNING_SUBJECTS: Record<number, string> = {
  1: "Ödemeniz alınamadı — Kart bilgilerinizi güncelleyin",
  2: "Size özel teklif: Aboneliğinizi kurtarın",
  3: "Son şans: Aboneliğiniz bugün sona eriyor",
};

export async function sendDunningEmail(input: DunningEmailInput): Promise<void> {
  const client = getClient();
  const subject = DUNNING_SUBJECTS[input.attemptNumber];
  const plan = planRow(input.planName, input.amount, input.currency);
  const discountUrl = input.discountUrl ?? input.updateUrl;
  const pauseUrl    = input.pauseUrl    ?? input.updateUrl;
  const offerType   = input.offerType   ?? "both";

  let html: string;
  if (input.attemptNumber === 1) {
    html = attempt1Html(input.businessName, input.updateUrl, plan);
  } else if (input.attemptNumber === 2) {
    html = attempt2Html(input.businessName, input.updateUrl, discountUrl, pauseUrl, offerType, plan);
  } else {
    html = attempt3Html(input.businessName, input.updateUrl, discountUrl, pauseUrl, plan);
  }

  if (!client) {
    console.log(`[Email Mock] Deneme ${input.attemptNumber} → ${input.to} | ${subject}`);
    return;
  }

  const fromDisplay = `"${input.businessName}" <${FROM_ADDRESS}>`;
  const { error } = await client.emails.send({ from: fromDisplay, to: input.to, subject, html });
  if (error) throw new Error(`Resend hatası: ${error.message}`);
  console.log(`[Email] Deneme ${input.attemptNumber} gönderildi → ${input.to}`);
}

// ─── Tenant bildirim emaili (Critical 1) ──────────────────────────────────────

const ACTION_LABELS: Record<string, { text: string; color: string }> = {
  CANCEL:           { text: "Aboneliği iptal etti",                color: "#ef4444" },
  ACCEPT_DISCOUNT:  { text: "İndirim teklifini kabul etti",        color: "#059669" },
  ACCEPT_PAUSE:     { text: "Dondurma teklifini kabul etti",       color: "#f59e0b" },
  ACCEPT_DOWNGRADE: { text: "Plan düşürme teklifini kabul etti",   color: "#6366f1" },
};

export interface TenantNotificationInput {
  to: string;
  tenantName: string;
  action: string;
  customerEmail?: string | null;
  customerPhone: string;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
  dashboardUrl?: string;
}

export async function sendTenantNotificationEmail(input: TenantNotificationInput): Promise<void> {
  const client = getClient();
  const actionInfo = ACTION_LABELS[input.action] ?? { text: input.action, color: "#64748b" };

  const plan = planRow(input.planName, input.amount, input.currency);
  const html = baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${actionInfo.color};text-transform:uppercase;letter-spacing:1px;">Müşteri Hareketi</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Bir müşteriniz işlem yaptı</h1>
    ${plan}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f8fafc;border:1px solid #e2e8f0;width:100%;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 10px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Müşteri Bilgisi</p>
          <p style="margin:0 0 4px;font-size:14px;color:#0f172a;">${input.customerPhone}</p>
          ${input.customerEmail ? `<p style="margin:0;font-size:14px;color:#475569;">${input.customerEmail}</p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;border-top:1px solid #e2e8f0;background:#fff;">
          <span style="display:inline-block;background:${actionInfo.color};color:#fff;font-size:12px;font-weight:700;padding:4px 12px;letter-spacing:0.5px;">
            ${actionInfo.text}
          </span>
        </td>
      </tr>
    </table>
    ${input.dashboardUrl ? `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="background:#111827;padding:12px 22px;">
          <a href="${input.dashboardUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Tenant Dashboard'a Git →</a>
        </td>
      </tr>
    </table>` : ""}
    <p style="margin:0;font-size:13px;color:#94a3b8;">Tenant: <strong>${input.tenantName}</strong></p>
  `);

  const subject = `[Subkoru] Müşteri hareketi: ${actionInfo.text}`;

  if (!client) {
    console.log(`[Email Mock] Tenant bildirim → ${input.to} | ${subject}`);
    return;
  }

  const { error } = await client.emails.send({ from: FROM_ADDRESS, to: input.to, subject, html });
  if (error) console.error(`[Tenant Bildirim] Resend hatası: ${error.message}`);
  else console.log(`[Tenant Bildirim] Gönderildi → ${input.to}`);
}

// ─── Müşteri onay emaili ─────────────────────────────────────────────────────

const CONFIRM_CONTENT: Record<
  string,
  { tag: string; tagColor: string; title: string; body: (b: string) => string }
> = {
  CANCEL: {
    tag: "Abonelik İptali",
    tagColor: "#ef4444",
    title: "Aboneliğiniz iptal edildi",
    body: (b) => `<strong>${b}</strong> aboneliğiniz başarıyla iptal edildi. Dilediğiniz zaman geri dönebilirsiniz.`,
  },
  ACCEPT_DISCOUNT: {
    tag: "İndirim Aktif",
    tagColor: "#059669",
    title: "İndiriminiz uygulandı",
    body: (b) => `<strong>${b}</strong> aboneliğinize özel indiriminiz bir sonraki dönemden itibaren uygulanacak.`,
  },
  ACCEPT_PAUSE: {
    tag: "Abonelik Donduruldu",
    tagColor: "#f59e0b",
    title: "Aboneliğiniz donduruldu",
    body: (b) => `<strong>${b}</strong> aboneliğiniz belirtilen süre için askıya alındı. Süre dolduğunda otomatik olarak devam edecek.`,
  },
  ACCEPT_DOWNGRADE: {
    tag: "Plan Değişikliği",
    tagColor: "#6366f1",
    title: "Plan değişikliği talebiniz alındı",
    body: (b) => `<strong>${b}</strong> ekibi daha uygun plan seçeneğinizi en kısa sürede işleme koyacak.`,
  },
};

export interface CustomerConfirmationInput {
  to: string;
  businessName: string;
  action: string;
  portalUrl?: string;
  emailConfig?: { fromName?: string | null; replyTo?: string | null; footerNote?: string | null } | null;
}

export async function sendCustomerConfirmationEmail(
  input: CustomerConfirmationInput
): Promise<void> {
  const client = getClient();
  const tmpl = CONFIRM_CONTENT[input.action];
  if (!tmpl) return;

  const footerText =
    input.emailConfig?.footerNote ??
    "Bu e-posta Subkoru tarafından otomatik olarak gönderilmiştir.";

  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8" /><title>Subkoru</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;">
        <tr><td style="background:#0f172a;padding:24px 32px;">
          <span style="color:#fff;font-size:18px;font-weight:700;">${input.emailConfig?.fromName ?? "Subkoru"}</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${tmpl.tagColor};text-transform:uppercase;letter-spacing:1px;">${tmpl.tag}</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">${tmpl.title}</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">${tmpl.body(input.businessName)}</p>
          ${input.portalUrl ? `<table cellpadding="0" cellspacing="0"><tr><td style="background:#0f172a;padding:12px 24px;"><a href="${input.portalUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Aboneliğimi Yönet →</a></td></tr></table>` : ""}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">${footerText}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const subject = `${tmpl.tag} — ${input.businessName}`;
  const fromAddr = input.emailConfig?.fromName
    ? `"${input.emailConfig.fromName}" <${FROM_ADDRESS}>`
    : FROM_ADDRESS;

  if (!client) {
    console.log(`[Email Mock] Müşteri onay → ${input.to} | ${subject}`);
    return;
  }

  const { error } = await client.emails.send({
    from: fromAddr,
    to: input.to,
    subject,
    html,
    ...(input.emailConfig?.replyTo ? { reply_to: input.emailConfig.replyTo } : {}),
  });
  if (error) console.error(`[Müşteri Onay] Resend hatası: ${error.message}`);
}

// ─── Winback emaili (Medium 5) ────────────────────────────────────────────────

export interface WinbackEmailInput {
  to: string;
  businessName: string;
  portalUrl: string;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
}

export async function sendWinbackEmail(input: WinbackEmailInput): Promise<void> {
  const client = getClient();
  const plan = planRow(input.planName, input.amount, input.currency);
  const html = baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;">Sizi Özledik</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Geri dönmek ister misiniz?</h1>
    ${plan}
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Merhaba,<br><br>
      <strong>${input.businessName}</strong> aboneliğinizi iptal ettiğinizden bu yana sizi özledik.
      Hizmetimize geri dönmek isterseniz tek tıkla aboneliğinizi yeniden başlatabilirsiniz.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#059669;padding:14px 28px;">
          <a href="${input.portalUrl}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Aboneliğimi Yeniden Başlat →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Bu e-postayı almak istemiyorsanız görmezden gelebilirsiniz.</p>
  `, "#059669", input.businessName);

  const subject = `${input.businessName} sizi özledi — Geri dönmek ister misiniz?`;

  if (!client) {
    console.log(`[Email Mock] Winback → ${input.to}`);
    return;
  }

  const fromDisplay = `"${input.businessName}" <${FROM_ADDRESS}>`;
  const { error } = await client.emails.send({ from: fromDisplay, to: input.to, subject, html });
  if (error) console.error(`[Winback] Resend hatası: ${error.message}`);
  else console.log(`[Winback] Gönderildi → ${input.to}`);
}
