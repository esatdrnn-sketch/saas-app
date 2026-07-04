"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type OfferType = "NONE" | "DISCOUNT" | "PAUSE" | "DOWNGRADE";
type CancelReason = "TOO_EXPENSIVE" | "TECHNICAL" | "TEMPORARY" | "ALTERNATIVE";

type OfferRow = { offerType: OfferType; value: number };
type OffersState = Record<CancelReason, OfferRow>;

const REASONS: { id: CancelReason; label: string }[] = [
  { id: "TOO_EXPENSIVE", label: "Çok pahalı" },
  { id: "TECHNICAL",     label: "Teknik sorunlar" },
  { id: "TEMPORARY",     label: "Geçici olarak ihtiyaç yok" },
  { id: "ALTERNATIVE",   label: "Alternatif bulundu" },
];

const DEFAULT_VALUES: Record<OfferType, number> = {
  NONE: 0,
  DISCOUNT: 50,
  PAUSE: 30,
  DOWNGRADE: 0,
};

const EMPTY_STATE: OffersState = {
  TOO_EXPENSIVE: { offerType: "NONE", value: 50 },
  TECHNICAL:     { offerType: "NONE", value: 50 },
  TEMPORARY:     { offerType: "NONE", value: 30 },
  ALTERNATIVE:   { offerType: "NONE", value: 50 },
};

type Tenant = { id: string; name: string };

export default function TenantOffersForm({ tenants }: { tenants: Tenant[] }) {
  const [tenantId, setTenantId] = useState("");
  const [offers, setOffers] = useState<OffersState>({ ...EMPTY_STATE });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    fetch(`/api/admin/tenant-offers?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((data) => {
        const next = { ...EMPTY_STATE };
        for (const o of (data.offers ?? []) as { reason: CancelReason; offerType: "DISCOUNT" | "PAUSE"; value: number | null }[]) {
          next[o.reason] = { offerType: o.offerType, value: o.value ?? DEFAULT_VALUES[o.offerType] };
        }
        setOffers(next);
      })
      .catch(() => setError("Teklifler yüklenemedi."))
      .finally(() => setLoading(false));
  }, [tenantId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = REASONS.map(({ id }) => ({
        reason: id,
        offerType: offers[id].offerType,
        value: offers[id].offerType === "NONE" ? null : offers[id].value,
      }));
      const res = await fetch("/api/admin/tenant-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, offers: payload }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error((d as { error?: string } | null)?.error ?? "Kayıt başarısız.");
      }
      setSuccess("Teklifler kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  function setOfferType(reason: CancelReason, type: OfferType) {
    setOffers((prev) => ({
      ...prev,
      [reason]: {
        offerType: type,
        value: type === "NONE" ? prev[reason].value : (prev[reason].offerType === type ? prev[reason].value : DEFAULT_VALUES[type]),
      },
    }));
  }

  function setValue(reason: CancelReason, v: number) {
    setOffers((prev) => ({ ...prev, [reason]: { ...prev[reason], value: v } }));
  }

  return (
    <form onSubmit={handleSave} className={styles.subForm}>
      <div className={styles.formRow}>
        <label className={styles.label}>Tenant</label>
        <select
          className={styles.input}
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          required
        >
          <option value="">— Tenant seçin —</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {tenantId && (
        loading ? (
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Yükleniyor…</p>
        ) : (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>İptal Nedeni</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>Teklif Türü</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>Değer</th>
                </tr>
              </thead>
              <tbody>
                {REASONS.map(({ id, label }, i) => {
                  const row = offers[id];
                  return (
                    <tr key={id} style={{ borderBottom: i < REASONS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#374151", fontWeight: 500 }}>{label}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <select
                          className={styles.input}
                          style={{ width: "auto", minWidth: 150 }}
                          value={row.offerType}
                          onChange={(e) => setOfferType(id, e.target.value as OfferType)}
                        >
                          <option value="NONE">Teklif Yok</option>
                          <option value="DISCOUNT">İndirim (%)</option>
                          <option value="PAUSE">Dondurma (gün)</option>
                          <option value="DOWNGRADE">Plan Düşürme</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {row.offerType === "DISCOUNT" || row.offerType === "PAUSE" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              className={styles.input}
                              style={{ width: 90 }}
                              min={1}
                              max={row.offerType === "DISCOUNT" ? 99 : 365}
                              value={row.value}
                              onChange={(e) => setValue(id, Number(e.target.value))}
                            />
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                              {row.offerType === "DISCOUNT" ? "%" : "gün"}
                            </span>
                          </div>
                        ) : row.offerType === "DOWNGRADE" ? (
                          <span style={{ fontSize: 13, color: "#6366f1" }}>Plan düşürme talebi iletilir</span>
                        ) : (
                          <span style={{ fontSize: 13, color: "#d1d5db" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {tenantId && !loading && (
        <div className={styles.formActions}>
          <button className={styles.btnPrimary} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {error && <span className={styles.formError}>{error}</span>}
          {success && <span className={styles.formSuccess}>{success}</span>}
        </div>
      )}
    </form>
  );
}
