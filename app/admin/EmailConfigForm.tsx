"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./admin.module.css";

type SimpleTenant = { id: string; name: string };
type Config = { fromName?: string | null; replyTo?: string | null; footerNote?: string | null };

export default function EmailConfigForm({ tenants }: { tenants: SimpleTenant[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    if (!tenantId) return;
    fetch(`/api/admin/email-config?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d: { config?: Config | null }) => {
        setFromName(d.config?.fromName ?? "");
        setReplyTo(d.config?.replyTo ?? "");
        setFooterNote(d.config?.footerNote ?? "");
      })
      .catch(() => {});
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/email-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, fromName, replyTo, footerNote }),
    });
    setSaving(false);
    setMsg(res.ok ? "Kaydedildi." : "Hata oluştu.");
  }

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Tenant</label>
        <select className={styles.select} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Gönderen Adı</label>
        <input
          className={styles.input}
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder='Örn: "Acme Destek" — müşteri emailde bunu görür'
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Yanıt Adresi (Reply-To)</label>
        <input
          className={styles.input}
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="destek@sirketiniz.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email Alt Notu</label>
        <textarea
          className={styles.input}
          rows={2}
          value={footerNote}
          onChange={(e) => setFooterNote(e.target.value)}
          placeholder="Bu e-posta Acme Yazılım tarafından gönderilmiştir. Sorularınız için destek@sirket.com"
          style={{ resize: "vertical" }}
        />
      </div>

      {msg && <p style={{ margin: 0, fontSize: 13, color: msg === "Kaydedildi." ? "#059669" : "#dc2626" }}>{msg}</p>}

      <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ alignSelf: "flex-start" }}>
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
