const ACTION_LABELS: Record<string, string> = {
  CANCEL:           "Iptal etti",
  ACCEPT_DISCOUNT:  "Indirim kabul etti",
  ACCEPT_PAUSE:     "Dondurma kabul etti",
  ACCEPT_DOWNGRADE: "Plan dusurme kabul etti",
  PAYMENT_FAILED:   "Odeme basarisiz",
  PAYMENT_SUCCESS:  "Odeme basarili",
  RECOVERED:        "Kart guncelledi - kurtarildi",
};

export async function sendSlackNotification(
  webhookUrl: string,
  opts: {
    action: string;
    tenantName: string;
    customerPhone: string;
    customerEmail?: string | null;
    planName?: string | null;
    status?: string;
  }
): Promise<void> {
  const label = ACTION_LABELS[opts.action] ?? opts.action;
  const customer = [
    opts.customerPhone,
    opts.customerEmail,
    opts.planName ? `(${opts.planName})` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const text = `[${opts.tenantName}] ${label}\n${customer}`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("[Slack] Gönderim hatası:", err);
  }
}
