"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TenantLoginPage() {
  const router = useRouter();
  const [loginKey, setLoginKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/tenant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginKey }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Giriş başarısız.");
      return;
    }

    router.push("/tenant/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b7280",
          }}
        >
          RecoverPanel
        </p>
        <h1
          style={{
            margin: "0 0 28px",
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          Tenant Girişi
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="loginKey"
              style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Giriş Anahtarı
            </label>
            <input
              id="loginKey"
              type="text"
              value={loginKey}
              onChange={(e) => setLoginKey(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
              style={{
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.02em",
              }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !loginKey.trim()}
            style={{
              marginTop: 4,
              padding: "11px 0",
              background: loading || !loginKey.trim() ? "#94a3b8" : "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !loginKey.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p style={{ margin: "24px 0 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
          Giriş anahtarınızı yöneticinizden alabilirsiniz.
        </p>
      </div>
    </main>
  );
}
