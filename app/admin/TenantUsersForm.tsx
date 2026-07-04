"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type User = { id: string; name: string; email: string; tenantId: string; tenant: { name: string } };

export default function TenantUsersForm({ tenants }: { tenants: { id: string; name: string }[] }) {
  const [tenantId, setTenantId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function fetchUsers(tid = tenantId) {
    if (!tid) return;
    setLoading(true);
    fetch(`/api/admin/tenant-users?tenantId=${tid}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUsers(tenantId);
    setError("");
    setSuccess("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/tenant-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, name, email, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Hata.");
      setSuccess(`"${name}" eklendi.`);
      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Bu kullanıcıyı silmek istiyor musunuz?")) return;
    await fetch("/api/admin/tenant-users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    fetchUsers();
  }

  return (
    <div className={styles.subForm}>
      <div className={styles.formRow}>
        <label className={styles.label}>Tenant</label>
        <select className={styles.input} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
          <option value="">— Tenant seçin —</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {tenantId && (
        <>
          {/* Kullanıcı listesi */}
          {loading ? (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Yükleniyor…</p>
          ) : users.length > 0 ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#6b7280" }}>Ad</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#6b7280" }}>E-posta</th>
                    <th style={{ padding: "10px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(u.id)}
                          style={{ fontSize: 12, color: "#ef4444", background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Bu tenant için kullanıcı yok.</p>
          )}

          {/* Yeni kullanıcı ekle */}
          <form onSubmit={handleAdd} style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <p className={styles.label} style={{ marginBottom: 0 }}>Yeni Kullanıcı Ekle</p>
            <div className={styles.formGridHalf}>
              <div className={styles.formRow}>
                <label className={styles.label}>Ad Soyad</label>
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ali Veli" required />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label}>E-posta</label>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ali@sirket.com" required />
              </div>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>Şifre</label>
              <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 8 karakter" minLength={8} required />
            </div>
            <div className={styles.formActions}>
              <button className={styles.btnPrimary} disabled={saving}>{saving ? "Ekleniyor…" : "Kullanıcı Ekle"}</button>
              {error && <span className={styles.formError}>{error}</span>}
              {success && <span className={styles.formSuccess}>{success}</span>}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
