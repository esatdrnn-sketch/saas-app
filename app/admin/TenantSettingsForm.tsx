"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type Tenant = {
  id: string;
  name: string;
  webhookUrl?: string | null;
  slackWebhookUrl?: string | null;
  notificationEmail?: string | null;
  brandColor?: string | null;
  logoUrl?: string | null;
  portalTitle?: string | null;
  winbackDays?: number;
  iyzicoApiKey?: string | null;
  iyzicoSecretKey?: string | null;
  iyzicoBaseUrl?: string | null;
};

const FIELDS: { key: keyof Tenant; label: string; placeholder: string; type?: string }[] = [
  { key: "name",              label: "Şirket Adı",          placeholder: "Acme Ltd.",                           type: "text"   },
  { key: "notificationEmail", label: "Bildirim E-postası",  placeholder: "admin@sirket.com",                    type: "email"  },
  { key: "webhookUrl",        label: "Webhook URL",         placeholder: "https://sirket.com/api/rp-webhook",   type: "url"    },
  { key: "slackWebhookUrl",  label: "Slack Webhook URL",  placeholder: "https://hooks.slack.com/services/…",  type: "url"    },
  { key: "brandColor",        label: "Marka Rengi (hex)",   placeholder: "#4f46e5",                             type: "text"   },
  { key: "logoUrl",           label: "Logo URL",            placeholder: "https://sirket.com/logo.png",         type: "url"    },
  { key: "portalTitle",       label: "Portal Başlığı",      placeholder: "Abonelik Yönetimi",                   type: "text"   },
  { key: "winbackDays",       label: "Winback Gün (0=kapalı)", placeholder: "7",                               type: "number" },
  { key: "iyzicoApiKey",     label: "iyzico API Key",         placeholder: "sandbox-…",                          type: "text"   },
  { key: "iyzicoSecretKey",  label: "iyzico Secret Key",      placeholder: "sandbox-secret-…",                   type: "password" },
  { key: "iyzicoBaseUrl",    label: "iyzico Base URL (opsiyonel)", placeholder: "https://api.iyzipay.com",        type: "url"    },
];

export default function TenantSettingsForm({ tenants }: { tenants: Tenant[] }) {
  const [tenantId, setTenantId] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    const t = tenants.find((t) => t.id === tenantId);
    if (!t) return;
    setForm({
      name:              t.name ?? "",
      notificationEmail: t.notificationEmail ?? "",
      webhookUrl:        t.webhookUrl ?? "",
      brandColor:        t.brandColor ?? "",
      logoUrl:           t.logoUrl ?? "",
      portalTitle:       t.portalTitle ?? "",
      winbackDays:       String(t.winbackDays ?? 7),
    });
    setError("");
    setSuccess("");
  }, [tenantId, tenants]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:              form.name,
          notificationEmail: form.notificationEmail,
          webhookUrl:        form.webhookUrl,
          brandColor:        form.brandColor,
          logoUrl:           form.logoUrl,
          portalTitle:       form.portalTitle,
          winbackDays:       Number(form.winbackDays),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(d?.error ?? "Kayıt başarısız.");
      }
      setSuccess("Kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className={styles.subForm}>
      <div className={styles.formRow}>
        <label className={styles.label}>Tenant</label>
        <select className={styles.input} value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
          <option value="">— Tenant seçin —</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {tenantId && (
        <>
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className={styles.formRow}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                type={type ?? "text"}
                placeholder={placeholder}
                value={form[key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                min={type === "number" ? 0 : undefined}
              />
            </div>
          ))}

          {form.brandColor && /^#[0-9a-fA-F]{6}$/.test(form.brandColor) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: form.brandColor, border: "1px solid #e5e7eb" }} />
              <span style={{ fontSize: 13, color: "#6b7280" }}>{form.brandColor}</span>
            </div>
          )}

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</button>
            {error && <span className={styles.formError}>{error}</span>}
            {success && <span className={styles.formSuccess}>{success}</span>}
          </div>
        </>
      )}
    </form>
  );
}
