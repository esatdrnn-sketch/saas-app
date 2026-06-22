"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function AddTenantForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata oluştu.");
      setSuccess(`"${data.tenant.name}" eklendi.`);
      setName("");
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.inlineForm}>
      <input
        className={styles.input}
        placeholder="Şirket adı (örn: Acme Ltd.)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className={styles.btnPrimary} disabled={loading}>
        {loading ? "Ekleniyor…" : "Ekle"}
      </button>
      {error && <span className={styles.formError}>{error}</span>}
      {success && <span className={styles.formSuccess}>{success}</span>}
    </form>
  );
}
