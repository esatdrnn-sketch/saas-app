"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "key" | "email";

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function TenantLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("key");
  const [loginKey, setLoginKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = mode === "key"
      ? { loginKey }
      : { email, password };

    const res = await fetch("/api/tenant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "36px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
          Subkoru
        </p>
        <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Tenant Girişi
        </h1>

        {/* Mod seçici */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 4 }}>
          {(["key", "email"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "7px 0",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: mode === m ? "#0f172a" : "transparent",
                color: mode === m ? "#fff" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {m === "key" ? "Giriş Anahtarı" : "E-posta / Şifre"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "key" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="loginKey" style={labelStyle}>Giriş Anahtarı</label>
              <input
                id="loginKey"
                type="text"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
                style={{ ...inputStyle, fontFamily: "ui-monospace, monospace", letterSpacing: "0.02em" }}
              />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="email" style={labelStyle}>E-posta</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ali@sirket.com" required style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="password" style={labelStyle}>Şifre</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
            </>
          )}

          {error && <p style={{ margin: 0, fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "11px 0",
              background: loading ? "#94a3b8" : "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p style={{ margin: "24px 0 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
          Giriş anahtarınızı veya kullanıcı bilgilerinizi yöneticinizden alabilirsiniz.
        </p>
      </div>
    </main>
  );
}
