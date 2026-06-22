"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function DunningButton({
  subscriptionId,
  disabled,
}: {
  subscriptionId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  async function handleClick() {
    if (!confirm("Bu aboneliğe dunning mesajı gönderilsin mi?")) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/dunning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true } : { error: data.error ?? "Hata" });
    } catch {
      setResult({ error: "Bağlantı hatası." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) return <span className={styles.formSuccess}>Gönderildi</span>;
  if (result?.error) return <span className={styles.formError}>{result.error}</span>;

  return (
    <button
      className={styles.btnDunning}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? "…" : "Dunning Gönder"}
    </button>
  );
}
