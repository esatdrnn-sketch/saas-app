"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./admin.module.css";

type SimpleTenant = { id: string; name: string };
type Testimonial = { id: string; customerName: string; role?: string | null; quote: string; displayOrder: number };

export default function TestimonialsForm({ tenants }: { tenants: SimpleTenant[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [items, setItems] = useState<Testimonial[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    if (!tenantId) return;
    fetch(`/api/admin/testimonials?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => d.items && setItems(d.items))
      .catch(() => {});
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !name.trim() || !quote.trim()) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, customerName: name.trim(), role: role.trim() || null, quote: quote.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setName(""); setRole(""); setQuote("");
      setMsg("Eklendi.");
      load();
    } else {
      setMsg("Hata oluştu.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yorumu silmek istiyor musunuz?")) return;
    await fetch("/api/admin/testimonials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Tenant</label>
        <select className={styles.select} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {items.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {items.map((t) => (
            <div key={t.id} style={{ border: "1px solid #e2e8f0", background: "#f8fafc", padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t.customerName}{t.role ? `, ${t.role}` : ""}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
              </div>
              <button onClick={() => handleDelete(t.id)} className={styles.btnDunning} style={{ borderColor: "#9ca3af", color: "#6b7280", flexShrink: 0 }}>Sil</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Müşteri Adı *</label>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmet Y." required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Unvan / Şirket</label>
            <input className={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Kurucu, Acme" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Yorum *</label>
          <textarea
            className={styles.input}
            rows={3}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Subkoru sayesinde iptal oranımızı %40 düşürdük."
            required
            style={{ resize: "vertical" }}
          />
        </div>
        {msg && <p style={{ margin: 0, fontSize: 13, color: msg.startsWith("H") ? "#dc2626" : "#059669" }}>{msg}</p>}
        <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ alignSelf: "flex-start" }}>
          {saving ? "Ekleniyor…" : "Yorum Ekle"}
        </button>
      </form>
    </div>
  );
}
