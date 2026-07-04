"use client";

import { useState } from "react";
import styles from "./admin.module.css";

type SimpleTenant = { id: string; name: string };

const APP_URL = "https://subkoru.com.tr";

export default function EmbedCodeDisplay({ tenants }: { tenants: SimpleTenant[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey]   = useState<string | null>(null);

  const tenantName = tenants.find((t) => t.id === tenantId)?.name ?? "Tenant";

  async function handleGenerate() {
    if (apiKey && !confirm("Mevcut API anahtarı geçersiz olacak. Devam edilsin mi?")) return;
    setGenerating(true);
    const res  = await fetch("/api/admin/generate-api-key", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ tenantId }),
    });
    const data = (await res.json()) as { apiKey?: string };
    setGenerating(false);
    if (data.apiKey) setApiKey(data.apiKey);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  const scriptTag  = `<script src="${APP_URL}/subkoru.js"></script>`;
  const usageCode  = `<!-- İptal butonunuz -->
<button onclick="Subkoru.open({
  apiKey:     '${apiKey ?? "sk_live_XXXXXXXXXX"}',
  customerId: currentUser.email,   // veya telefon numarası
  onSave:     () => console.log('Abonelik kurtarıldı!'),
  onCancel:   () => console.log('Kullanıcı iptal etti.'),
  onClose:    () => {},
})">
  Aboneliği Yönet
</button>`;

  const reactCode = `// React projelerinde
import { useEffect } from 'react';

function CancelButton({ userEmail }) {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '${APP_URL}/subkoru.js';
    document.head.appendChild(s);
  }, []);

  return (
    <button onClick={() =>
      window.Subkoru?.open({
        apiKey:     '${apiKey ?? "sk_live_XXXXXXXXXX"}',
        customerId: userEmail,
        onSave:   () => toast.success('Aboneliğiniz devam ediyor!'),
        onCancel: () => router.push('/goodbye'),
      })
    }>
      Aboneliği İptal Et
    </button>
  );
}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Tenant seç + API Key üret */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "flex-end" }}>
        <div className={styles.formRow}>
          <label className={styles.label}>Tenant</label>
          <select
            className={styles.input}
            value={tenantId}
            onChange={(e) => { setTenantId(e.target.value); setApiKey(null); }}
          >
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleGenerate}
          disabled={generating}
          style={{ height: 40 }}
        >
          {generating ? "Üretiliyor…" : apiKey ? "Yenile" : "API Anahtarı Üret"}
        </button>
      </div>

      {/* API Key göster */}
      {apiKey && (
        <Block label="API Anahtarı" color="#f0fdf4" border="#bbf7d0" labelColor="#15803d">
          <CodeRow
            code={apiKey}
            copyKey="apikey"
            copiedKey={copiedKey}
            onCopy={() => copy(apiKey, "apikey")}
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>
            Bu anahtarı güvenli saklayın — tekrar gösterilmeyecek.
          </p>
        </Block>
      )}

      {/* Adım 1 — script etiketi */}
      <Block label="1. Script etiketini ekleyin" hint="Sitenizin </body> kapanış etiketinden hemen önce">
        <CodeRow
          code={scriptTag}
          copyKey="script"
          copiedKey={copiedKey}
          onCopy={() => copy(scriptTag, "script")}
        />
      </Block>

      {/* Adım 2 — kullanım */}
      <Block label={`2. İptal butonuna bağlayın — ${tenantName}`} hint="customerId olarak müşterinizin email veya telefon numarasını gönderin">
        <CodeBlock code={usageCode} copyKey="usage" copiedKey={copiedKey} onCopy={() => copy(usageCode, "usage")} />
      </Block>

      {/* Adım 3 — React */}
      <Block label="React / Next.js projelerinde" hint="Script'i dinamik olarak yükleyip window.Subkoru.open() çağırabilirsiniz">
        <CodeBlock code={reactCode} copyKey="react" copiedKey={copiedKey} onCopy={() => copy(reactCode, "react")} />
      </Block>

      {/* Callback tablosu */}
      <Block label="Callback Olayları">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Callback", "Ne zaman tetiklenir", "Önerilen aksiyon"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["onSave",   "Kullanıcı teklifi kabul etti (indirim / dondurma / plan düşürme)", "Sayfayı yenile, \"Teşekkürler\" mesajı göster"],
              ["onCancel", "Kullanıcı iptali onayladı",                                         "Oturumu kapat veya veda sayfasına yönlendir"],
              ["onClose",  "Kullanıcı pencereyi kapattı (karar vermeden)",                       "Hiçbir şey yapmana gerek yok"],
              ["onError",  "API anahtarı yanlış veya abonelik bulunamadı",                       "Yedek olarak portal linkine yönlendir"],
            ].map(([cb, when, action]) => (
              <tr key={cb} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 14px", fontFamily: "ui-monospace, monospace", color: "#4f46e5", fontWeight: 700, fontSize: 12 }}>{cb}</td>
                <td style={{ padding: "12px 14px", color: "#374151" }}>{when}</td>
                <td style={{ padding: "12px 14px", color: "#6b7280" }}>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

    </div>
  );
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────

function Block({ label, hint, children, color = "#f8fafc", border = "#e2e8f0", labelColor = "#111827" }: {
  label: string; hint?: string; children: React.ReactNode;
  color?: string; border?: string; labelColor?: string;
}) {
  return (
    <div style={{ background: color, border: `1px solid ${border}`, borderRadius: 10, padding: "16px 18px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: labelColor, letterSpacing: "0.03em" }}>{label}</p>
      {hint && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>{hint}</p>}
      {children}
    </div>
  );
}

function CodeRow({ code, copyKey, copiedKey, onCopy }: {
  code: string; copyKey: string; copiedKey: string | null; onCopy(): void;
}) {
  const copied = copiedKey === copyKey;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <code style={{ flex: 1, fontSize: 12, fontFamily: "ui-monospace, monospace", background: "#fff", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: 6, wordBreak: "break-all", color: "#0f172a" }}>
        {code}
      </code>
      <button
        onClick={onCopy}
        style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 6, background: copied ? "#f0fdf4" : "#fff", color: copied ? "#059669" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
      >
        {copied ? "Kopyalandı" : "Kopyala"}
      </button>
    </div>
  );
}

function CodeBlock({ code, copyKey, copiedKey, onCopy }: {
  code: string; copyKey: string; copiedKey: string | null; onCopy(): void;
}) {
  const copied = copiedKey === copyKey;
  return (
    <div style={{ position: "relative" }}>
      <pre style={{ margin: 0, padding: "14px 16px", background: "#0f172a", borderRadius: 8, color: "#e2e8f0", fontSize: 12, fontFamily: "ui-monospace, monospace", lineHeight: 1.75, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {code}
      </pre>
      <button
        onClick={onCopy}
        style={{ position: "absolute", top: 10, right: 10, padding: "5px 12px", border: "none", borderRadius: 5, background: copied ? "#059669" : "#334155", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
      >
        {copied ? "Kopyalandı" : "Kopyala"}
      </button>
    </div>
  );
}
