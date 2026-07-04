"use client";

import { useState } from "react";
import styles from "./admin.module.css";

type SimpleTenant = { id: string; name: string };

export default function ApiKeyDisplay({ tenants }: { tenants: SimpleTenant[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!confirm("Mevcut API anahtarı geçersiz olacak. Devam edilsin mi?")) return;
    setGenerating(true);
    const res = await fetch("/api/admin/generate-api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
    const data = (await res.json()) as { apiKey?: string };
    setGenerating(false);
    if (data.apiKey) setApiKey(data.apiKey);
  }

  function handleCopy() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Tenant</label>
        <select className={styles.select} value={tenantId} onChange={(e) => { setTenantId(e.target.value); setApiKey(null); }}>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {apiKey && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.05em" }}>API Anahtarı Oluşturuldu</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <code style={{ fontSize: 12, fontFamily: "ui-monospace, monospace", color: "#0f172a", background: "#fff", border: "1px solid #e2e8f0", padding: "6px 10px", flex: 1, wordBreak: "break-all" }}>
              {apiKey}
            </code>
            <button onClick={handleCopy} className={styles.btnLink} style={{ flexShrink: 0 }}>
              {copied ? "Kopyalandı!" : "Kopyala"}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>Bu anahtarı güvenli bir yerde saklayın. Tekrar gösterilmeyecek.</p>
        </div>
      )}

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px" }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>API Kullanımı</p>
        <code style={{ fontSize: 12, fontFamily: "ui-monospace, monospace", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          {`GET ${appUrl}/api/tenant/subscriptions\nAuthorization: Bearer <api_key>\n\n# Opsiyonel parametreler:\n?status=ACTIVE&page=1&limit=50`}
        </code>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className={styles.btnPrimary}
        style={{ alignSelf: "flex-start" }}
      >
        {generating ? "Oluşturuluyor…" : "Yeni API Anahtarı Üret"}
      </button>
    </div>
  );
}
