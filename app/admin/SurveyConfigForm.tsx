"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type CancelReason = "TOO_EXPENSIVE" | "TECHNICAL" | "TEMPORARY" | "ALTERNATIVE";

const DEFAULTS: Record<CancelReason, { label: string; description: string }> = {
  TOO_EXPENSIVE: { label: "Çok pahalı",                    description: "Fiyatlandırma bütçemi aşıyor" },
  TECHNICAL:     { label: "Teknik sorunlar yaşıyorum",     description: "Ürün beklediğim gibi çalışmıyor" },
  TEMPORARY:     { label: "Geçici olarak ihtiyacım yok",   description: "Şu an kullanmıyorum ama geri dönebilirim" },
  ALTERNATIVE:   { label: "Başka bir alternatif buldum",   description: "Farklı bir çözüme geçiyorum" },
};

type Row = { label: string; description: string };
type State = Record<CancelReason, Row>;

const REASONS = Object.keys(DEFAULTS) as CancelReason[];

export default function SurveyConfigForm({ tenants }: { tenants: { id: string; name: string }[] }) {
  const [tenantId, setTenantId] = useState("");
  const [rows, setRows] = useState<State>({ ...DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    fetch(`/api/admin/survey-questions?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((data) => {
        const next: State = { ...DEFAULTS };
        for (const c of (data.configs ?? []) as { reason: CancelReason; label: string; description: string }[]) {
          next[c.reason] = { label: c.label, description: c.description };
        }
        setRows(next);
      })
      .catch(() => setError("Yüklenemedi."))
      .finally(() => setLoading(false));
  }, [tenantId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/survey-questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          configs: REASONS.map((r) => ({ reason: r, label: rows[r].label, description: rows[r].description })),
        }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız.");
      setSuccess("Anket soruları kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  function update(reason: CancelReason, field: "label" | "description", value: string) {
    setRows((p) => ({ ...p, [reason]: { ...p[reason], [field]: value } }));
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

      {tenantId && (loading ? (
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Yükleniyor…</p>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
            Boş bırakılan seçenekler varsayılan metni kullanır.
          </p>
          {REASONS.map((reason) => (
            <div key={reason} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <span className={styles.label} style={{ color: "#4f46e5" }}>{reason}</span>
              <div className={styles.formGridHalf}>
                <div className={styles.formRow}>
                  <label className={styles.label}>Başlık</label>
                  <input
                    className={styles.input}
                    value={rows[reason].label}
                    placeholder={DEFAULTS[reason].label}
                    onChange={(e) => update(reason, "label", e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.label}>Açıklama</label>
                  <input
                    className={styles.input}
                    value={rows[reason].description}
                    placeholder={DEFAULTS[reason].description}
                    onChange={(e) => update(reason, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className={styles.formActions}>
            <button className={styles.btnPrimary} disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</button>
            {error && <span className={styles.formError}>{error}</span>}
            {success && <span className={styles.formSuccess}>{success}</span>}
          </div>
        </>
      ))}
    </form>
  );
}
