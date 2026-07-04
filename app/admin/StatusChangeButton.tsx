"use client";

import { useState } from "react";
import styles from "./admin.module.css";

const STATUSES = ["ACTIVE", "PAST_DUE", "PAUSED", "RECOVERED", "CANCELLED"] as const;
type Status = typeof STATUSES[number];

const STATUS_LABEL: Record<Status, string> = {
  ACTIVE:    "Aktif",
  PAST_DUE:  "Ödeme Başarısız",
  PAUSED:    "Donduruldu",
  RECOVERED: "Kurtarıldı",
  CANCELLED: "İptal",
};

export default function StatusChangeButton({
  id,
  current,
}: {
  id: string;
  current: Status;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function change(status: Status) {
    if (status === current) { setOpen(false); return; }
    setLoading(true);
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={styles.btnLink}
        style={{ fontSize: 12 }}
      >
        {loading ? "…" : "Durum"}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "100%", right: 0, zIndex: 10,
            background: "#fff", border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 160, marginTop: 4,
          }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => change(s)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 14px", fontSize: 13, border: "none", cursor: "pointer",
                  background: s === current ? "#f1f5f9" : "#fff",
                  fontWeight: s === current ? 700 : 400,
                  color: s === current ? "#0f172a" : "#374151",
                }}
              >
                {STATUS_LABEL[s]}
                {s === current ? " ✓" : ""}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
