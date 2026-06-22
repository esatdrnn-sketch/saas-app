"use client";

import { useState } from "react";
import styles from "./admin.module.css";

type Tenant = { id: string; name: string };

export default function AddSubscriptionForm({
  tenants,
  onAdded,
}: {
  tenants: Tenant[];
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    tenantId: tenants[0]?.id ?? "",
    customerPhone: "",
    customerEmail: "",
    planName: "",
    amount: "",
    currency: "TRY",
    iyzicoSubRef: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount ? parseFloat(form.amount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      setSuccess("Abonelik oluşturuldu.");
      setForm((f) => ({
        ...f,
        customerPhone: "",
        customerEmail: "",
        planName: "",
        amount: "",
        iyzicoSubRef: "",
      }));
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
        <label className={styles.label}>Tenant</label>
        <select
          className={styles.input}
          value={form.tenantId}
          onChange={(e) => set("tenantId", e.target.value)}
          required
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Telefon *</label>
        <input
          className={styles.input}
          placeholder="05551234567"
          value={form.customerPhone}
          onChange={(e) => set("customerPhone", e.target.value)}
          required
        />
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>E-posta</label>
        <input
          className={styles.input}
          type="email"
          placeholder="musteri@sirket.com"
          value={form.customerEmail}
          onChange={(e) => set("customerEmail", e.target.value)}
        />
      </div>
      <div className={styles.formGridHalf}>
        <div className={styles.formRow}>
          <label className={styles.label}>Plan Adı</label>
          <input
            className={styles.input}
            placeholder="Pro"
            value={form.planName}
            onChange={(e) => set("planName", e.target.value)}
          />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>Tutar</label>
          <input
            className={styles.input}
            type="number"
            placeholder="2490"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>iyzico Referans Kodu</label>
        <input
          className={styles.input}
          placeholder="iyzico sub ref (opsiyonel)"
          value={form.iyzicoSubRef}
          onChange={(e) => set("iyzicoSubRef", e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button className={styles.btnPrimary} disabled={loading}>
          {loading ? "Kaydediliyor…" : "Abonelik Oluştur"}
        </button>
        {error && <span className={styles.formError}>{error}</span>}
        {success && <span className={styles.formSuccess}>{success}</span>}
      </div>
    </form>
  );
}
