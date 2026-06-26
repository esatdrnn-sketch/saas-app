"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function ResetDunningButton({ subscriptionId }: { subscriptionId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    if (!confirm("Dunning denemeleri ve WhatsApp oturumu sıfırlansın mı?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, { method: "POST" });
      if (res.ok) { setDone(true); setTimeout(() => window.location.reload(), 800); }
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className={styles.formSuccess}>Sıfırlandı</span>;

  return (
    <button className={styles.btnSecondary} onClick={handleClick} disabled={loading}>
      {loading ? "…" : "Sıfırla"}
    </button>
  );
}
