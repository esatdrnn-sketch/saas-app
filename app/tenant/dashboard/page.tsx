import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CANCEL_REASON_LABELS, CANCEL_REASON_ORDER } from "@/lib/cancellation";
import TenantLogoutButton from "./TenantLogoutButton";

export const dynamic = "force-dynamic";

async function getTenantId(): Promise<string | null> {
  const store = await cookies();
  return store.get("tenant_session")?.value ?? null;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  PAST_DUE: "Ödeme Başarısız",
  RECOVERED: "Kurtarıldı",
  PAUSED: "Donduruldu",
  CANCELLED: "İptal",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#2563eb",
  PAST_DUE: "#dc2626",
  RECOVERED: "#059669",
  PAUSED: "#d97706",
  CANCELLED: "#6b7280",
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: "#eff6ff",
  PAST_DUE: "#fef2f2",
  RECOVERED: "#ecfdf5",
  PAUSED: "#fef3c7",
  CANCELLED: "#f3f4f6",
};

function fmt(amount: number | null, currency: string) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount);
}

export default async function TenantDashboardPage() {
  const tenantId = await getTenantId();
  if (!tenantId) redirect("/tenant/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, loginKey: true },
  });
  if (!tenant) redirect("/tenant/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
    include: {
      dunningAttempts: { orderBy: { attemptNumber: "desc" }, take: 1 },
      cancellationEvents: { select: { reason: true, action: true } },
    },
  });

  const total = subscriptions.length;
  const pastDue = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const recovered = subscriptions.filter((s) => s.status === "RECOVERED").length;
  const cancelled = subscriptions.filter((s) => s.status === "CANCELLED").length;
  const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const recoveryRate =
    pastDue + recovered > 0 ? Math.round((recovered / (pastDue + recovered)) * 100) : 0;

  const allCancelEvents = subscriptions.flatMap((s) => s.cancellationEvents);
  const reasonCounts = CANCEL_REASON_ORDER.map((r) => ({
    label: CANCEL_REASON_LABELS[r],
    count: allCancelEvents.filter((e) => e.reason === r).length,
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 64px" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#6b7280",
              }}
            >
              Subkoru
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              {tenant.name}
            </h1>
          </div>
          <TenantLogoutButton />
        </header>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Toplam Abonelik", value: total, hint: "" },
            { label: "Aktif", value: active, hint: "", color: "#2563eb" },
            { label: "Ödeme Başarısız", value: pastDue, hint: "", color: pastDue > 0 ? "#dc2626" : undefined },
            { label: "Kurtarılan", value: recovered, hint: "", color: "#059669" },
            { label: "İptal", value: cancelled, hint: "" },
            { label: "Kurtarma Oranı", value: `%${recoveryRate}`, hint: `${recovered} / ${pastDue + recovered}` },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "20px 22px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
                {s.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: s.color ?? "#0f172a",
                }}
              >
                {s.value}
              </p>
              {s.hint && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>{s.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Subscription table */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
              Abonelikler
            </h2>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{total} kayıt</span>
          </div>

          {subscriptions.length === 0 ? (
            <div style={{ padding: "48px 28px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              Henüz abonelik yok.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Müşteri", "Plan", "Tutar", "Durum", "Dunning", "Portal"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#6b7280",
                          background: "#fafafa",
                          borderBottom: "1px solid #e2e8f0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const last = sub.dunningAttempts[0];
                    return (
                      <tr key={sub.id}>
                        <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#374151" }}>
                          <div>{sub.customerPhone}</div>
                          {sub.customerEmail && (
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                              {sub.customerEmail}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#374151" }}>
                          {sub.planName ?? "—"}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: 13,
                            color: "#4b5563",
                            fontFamily: "ui-monospace, monospace",
                          }}
                        >
                          {fmt(sub.amount, sub.currency)}
                        </td>
                        <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              color: STATUS_COLOR[sub.status] ?? "#374151",
                              background: STATUS_BG[sub.status] ?? "#f3f4f6",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {STATUS_LABEL[sub.status] ?? sub.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: 13,
                            color: "#6b7280",
                            fontFamily: "ui-monospace, monospace",
                          }}
                        >
                          {last ? `${last.attemptNumber}. deneme` : "—"}
                        </td>
                        <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <a
                              href={`${appUrl}/?token=${sub.updateToken}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 12, color: "#4f46e5", textDecoration: "underline", textUnderlineOffset: 2 }}
                            >
                              Ac →
                            </a>
                            {sub.status === "PAUSED" && sub.pauseUntil && (
                              <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>
                                {Math.max(0, Math.ceil((sub.pauseUntil.getTime() - Date.now()) / 86400000))} gun kaldi
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cancel reasons */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
              İptal Nedenleri
            </h2>
          </div>
          <div style={{ padding: "16px 28px 24px" }}>
            {reasonCounts.every((r) => r.count === 0) ? (
              <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>Henüz iptal akışı tamamlanmadı.</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {reasonCounts.map((r) => (
                  <li
                    key={r.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "10px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 14,
                      color: "#374151",
                    }}
                  >
                    <span>{r.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Login key info */}
        <div
          style={{
            marginTop: 32,
            padding: "14px 20px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Giriş Anahtarınız:</span>
          <code
            style={{
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
              color: "#374151",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {tenant.loginKey}
          </code>
        </div>
      </div>
    </main>
  );
}
