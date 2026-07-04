"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function AddTenantForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, webhookUrl: webhookUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      setSuccess(`"${data.tenant.name}" eklendi.`);
      setName("");
      setWebhookUrl("");
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.subForm}>
      <div className={styles.formRow}>
        <label className={styles.label}>Şirket Adı</label>
        <input
          className={styles.input}
          placeholder="örn: Acme Ltd."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Webhook URL <span style={{ fontWeight: 400, textTransform: "none", color: "#9ca3af" }}>(opsiyonel)</span></label>
        <input
          className={styles.input}
          placeholder="https://siteniz.com/api/Subkoru-webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          type="url"
        />
        <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          Abonelik durumu değiştiğinde bu URL&apos;ye POST gönderilir.
        </span>
      </div>
      <div className={styles.formActions}>
        <button className={styles.btnPrimary} disabled={loading}>
          {loading ? "Ekleniyor…" : "Ekle"}
        </button>
        {error && <span className={styles.formError}>{error}</span>}
        {success && <span className={styles.formSuccess}>{success}</span>}
      </div>
    </form>
  );
}
