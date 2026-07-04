export async function fireTenantWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  const body = JSON.stringify({ ...payload, timestamp: new Date().toISOString() });
  const headers = { "Content-Type": "application/json" };
  let success = false;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(webhookUrl, { method: "POST", headers, body });
      if (res.ok) { success = true; break; }
      console.warn(`[TenantWebhook] Deneme ${attempt} → HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[TenantWebhook] Deneme ${attempt} hatası:`, err);
    }
  }

  if (!success) {
    console.error(`[TenantWebhook] 3 denemeden sonra başarısız: ${webhookUrl}`);
  }
}
