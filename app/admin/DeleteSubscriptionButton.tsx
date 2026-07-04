"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function DeleteSubscriptionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu aboneliği silmek istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setLoading(true);
    await fetch(`/api/admin/subscriptions/${id}`, { method: "DELETE" });
    setLoading(false);
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={styles.btnDunning}
      style={{ borderColor: "#9ca3af", color: "#6b7280" }}
    >
      {loading ? "…" : "Sil"}
    </button>
  );
}
