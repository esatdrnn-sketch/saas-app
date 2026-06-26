import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";
import { CANCEL_REASON_LABELS, CANCEL_REASON_ORDER } from "@/lib/cancellation";
import styles from "./admin.module.css";
import LogoutButton from "./LogoutButton";
import AdminClient from "./AdminClient";
import DunningButton from "./DunningButton";
import ResetDunningButton from "./ResetDunningButton";
import CopyPortalLink from "./CopyPortalLink";
import DeleteSubscriptionButton from "./DeleteSubscriptionButton";
import StatusChangeButton from "./StatusChangeButton";

export const dynamic = "force-dynamic";

const DAY_SHORTS = ["P", "P", "S", "Ç", "P", "C", "C"];

const statusConfig: Record<SubscriptionStatus, { label: string; className: string }> = {
  PAST_DUE:  { label: "PAST_DUE",  className: styles.pastDue },
  RECOVERED: { label: "RECOVERED", className: styles.recovered },
  ACTIVE:    { label: "ACTIVE",    className: styles.active },
  PAUSED:    { label: "PAUSED",    className: styles.paused },
  CANCELLED: { label: "CANCELLED", className: styles.cancelled },
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const c = statusConfig[status];
  return <span className={`${styles.badge} ${c.className}`}>{c.label}</span>;
}

function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount);
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  SUBSCRIPTION_STATUS_CHANGED: "Durum Değiştirildi",
  SUBSCRIPTION_DELETED: "Abonelik Silindi",
  SUBSCRIPTION_CREATED: "Abonelik Oluşturuldu",
  SUBSCRIPTION_REACTIVATED: "Abonelik Yeniden Başlatıldı",
  CANCEL_FLOW_COMPLETED: "İptal Akışı Tamamlandı",
  API_KEY_GENERATED: "API Anahtarı Üretildi",
  TENANT_UPDATED: "Tenant Güncellendi",
};

export default async function AdminPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [subscriptions, cancellationEvents, tenants, failedToday, dunningAttempts, autoCancelledCount, auditLogs] =
    await Promise.all([
      prisma.subscription.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, status: true, customerPhone: true, customerEmail: true,
          planName: true, amount: true, currency: true, updateToken: true,
          pauseUntil: true,
          tenant: { select: { name: true } },
          dunningAttempts: { orderBy: { attemptNumber: "desc" }, take: 1, select: { attemptNumber: true } },
        },
      }),
      prisma.cancellationEvent.findMany({
        select: {
          reason: true, action: true, createdAt: true,
          subscription: { select: { amount: true, currency: true, tenantId: true, tenant: { select: { name: true } } } },
        },
      }),
      prisma.tenant.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, loginKey: true, webhookUrl: true, slackWebhookUrl: true, notificationEmail: true, brandColor: true, logoUrl: true, portalTitle: true, winbackDays: true, iyzicoApiKey: true, iyzicoSecretKey: true, iyzicoBaseUrl: true },
      }),
      prisma.subscription.count({ where: { status: "PAST_DUE", updatedAt: { gte: todayStart } } }),
      prisma.dunningAttempt.findMany({ where: { sentAt: { gte: sevenDaysAgo } }, select: { sentAt: true } }),
      prisma.subscription.count({ where: { status: "CANCELLED", dunningAttempts: { some: { attemptNumber: 3 } } } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, action: true, entityType: true, entityId: true, actorType: true, metadata: true, createdAt: true } }),
    ]);

  const pastDueCount   = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const recoveredCount = subscriptions.filter((s) => s.status === "RECOVERED").length;
  const pausedCount    = subscriptions.filter((s) => s.status === "PAUSED").length;
  const activeCount    = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const recoveryRate   = (pastDueCount + recoveredCount) > 0
    ? Math.round((recoveredCount / (pastDueCount + recoveredCount)) * 100)
    : 0;

  // MRR hesaplama
  const mrrTotal = subscriptions
    .filter((s) => s.status === "ACTIVE" && s.amount != null)
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);

  const reasonCounts = CANCEL_REASON_ORDER.map((reason) => ({
    label: CANCEL_REASON_LABELS[reason],
    count: cancellationEvents.filter((e) => e.reason === reason).length,
  }));

  const discountAccepted   = cancellationEvents.filter((e) => e.action === "ACCEPT_DISCOUNT").length;
  const pauseAccepted      = cancellationEvents.filter((e) => e.action === "ACCEPT_PAUSE").length;
  const downgradeAccepted  = cancellationEvents.filter((e) => e.action === "ACCEPT_DOWNGRADE").length;
  const totalEvents        = cancellationEvents.length;
  const savedEvents        = discountAccepted + pauseAccepted + downgradeAccepted;
  const conversionRate     = totalEvents > 0 ? Math.round((savedEvents / totalEvents) * 100) : 0;

  // Kurtarılan gelir hesabı
  const savedActions = new Set(["ACCEPT_DISCOUNT", "ACCEPT_PAUSE", "ACCEPT_DOWNGRADE"]);
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0);

  const recoveredEvents = cancellationEvents.filter((e) => savedActions.has(e.action));
  const totalRecoveredRevenue = recoveredEvents.reduce((sum, e) => sum + (e.subscription.amount ?? 0), 0);
  const thisMonthRecoveredRevenue = recoveredEvents
    .filter((e) => e.createdAt >= thisMonthStart)
    .reduce((sum, e) => sum + (e.subscription.amount ?? 0), 0);
  const myTotalCut    = Math.round(totalRecoveredRevenue * 0.10 * 100) / 100;
  const myMonthCut    = Math.round(thisMonthRecoveredRevenue * 0.10 * 100) / 100;

  // Tenant bazında kurtarılan gelir
  const recoveredByTenant: Record<string, { name: string; amount: number }> = {};
  for (const e of recoveredEvents) {
    const tid = e.subscription.tenantId;
    if (!recoveredByTenant[tid]) recoveredByTenant[tid] = { name: e.subscription.tenant.name, amount: 0 };
    recoveredByTenant[tid].amount += e.subscription.amount ?? 0;
  }
  const tenantRecoveries = Object.values(recoveredByTenant).sort((a, b) => b.amount - a.amount);

  function fmtTRY(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
  }

  // 7 günlük grafik verisi
  const countsByDay: Record<string, number> = {};
  for (const a of dunningAttempts) {
    const key = a.sentAt.toISOString().slice(0, 10);
    countsByDay[key] = (countsByDay[key] ?? 0) + 1;
  }
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { day: DAY_SHORTS[d.getDay()], value: countsByDay[key] ?? 0 };
  });
  const chartMax = Math.max(...chartDays.map((d) => d.value), 1);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div>
            <p className={styles.brand}>Subkoru</p>
            <h1 className={styles.heading}>Yönetim Paneli</h1>
          </div>
          <LogoutButton />
        </header>

        {/* Stats */}
        <div className={styles.statsGrid5}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Kurtarma Oranı</p>
            <p className={styles.statValue}>%{recoveryRate}</p>
            <p className={styles.statHint}>{recoveredCount} kurtarıldı · {pastDueCount} başarısız</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Toplam Abonelik</p>
            <p className={styles.statValue}>{subscriptions.length}</p>
            <p className={styles.statHint}>{activeCount} aktif · {pausedCount} donduruldu</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Aktif Dunning</p>
            <p className={`${styles.statValue} ${pastDueCount > 0 ? styles.statDanger : ""}`}>
              {pastDueCount}
            </p>
            <p className={styles.statHint}>PAST_DUE abonelik</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Bugün Başarısız</p>
            <p className={`${styles.statValue} ${failedToday > 0 ? styles.statDanger : ""}`}>
              {failedToday}
            </p>
            <p className={styles.statHint}>yeni PAST_DUE</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Otomatik İptal</p>
            <p className={styles.statValue}>{autoCancelledCount}</p>
            <p className={styles.statHint}>3. denemeden sonra</p>
          </div>
        </div>

        {/* MRR + Dönüşüm */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Aylık Gelir (MRR)</p>
            <p className={styles.statValue} style={{ fontSize: 22 }}>
              {mrrTotal > 0 ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(mrrTotal) : "—"}
            </p>
            <p className={styles.statHint}>{activeCount} aktif abonelikten</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Portal Dönüşüm Oranı</p>
            <p className={styles.statValue} style={{ fontSize: 22 }}>%{conversionRate}</p>
            <p className={styles.statHint}>{savedEvents} kurtarıldı / {totalEvents} portal akışı</p>
          </div>
        </div>

        {/* Kurtarılan Gelir */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className={styles.statCard} style={{ borderTop: "3px solid #059669" }}>
            <p className={styles.statLabel}>Toplam Kurtarılan</p>
            <p className={styles.statValue} style={{ fontSize: 20, color: "#059669" }}>
              {totalRecoveredRevenue > 0 ? fmtTRY(totalRecoveredRevenue) : "—"}
            </p>
            <p className={styles.statHint}>{recoveredEvents.length} kurtarma olayı</p>
          </div>
          <div className={styles.statCard} style={{ borderTop: "3px solid #059669" }}>
            <p className={styles.statLabel}>Bu Ay Kurtarılan</p>
            <p className={styles.statValue} style={{ fontSize: 20, color: "#059669" }}>
              {thisMonthRecoveredRevenue > 0 ? fmtTRY(thisMonthRecoveredRevenue) : "—"}
            </p>
            <p className={styles.statHint}>bu ay</p>
          </div>
          <div className={styles.statCard} style={{ borderTop: "3px solid #4f46e5" }}>
            <p className={styles.statLabel}>Toplam Kazancım (%10)</p>
            <p className={styles.statValue} style={{ fontSize: 20, color: "#4f46e5" }}>
              {myTotalCut > 0 ? fmtTRY(myTotalCut) : "—"}
            </p>
            <p className={styles.statHint}>tüm zamanlar</p>
          </div>
          <div className={styles.statCard} style={{ borderTop: "3px solid #4f46e5" }}>
            <p className={styles.statLabel}>Bu Ay Kazancım</p>
            <p className={styles.statValue} style={{ fontSize: 20, color: "#4f46e5" }}>
              {myMonthCut > 0 ? fmtTRY(myMonthCut) : "—"}
            </p>
            <p className={styles.statHint}>bu ay faturası</p>
          </div>
        </div>

        {/* Müşteri bazında kurtarılan gelir */}
        {tenantRecoveries.length > 0 && (
          <section className={`${styles.panel} ${styles.panelSpaced}`}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Müşteri Bazında Kurtarılan Gelir</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Müşteri", "Toplam Kurtarılan", "Senin Payın (%10)"].map((h) => (
                      <th key={h} className={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantRecoveries.map((t) => (
                    <tr key={t.name}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{t.name}</td>
                      <td className={styles.td} style={{ color: "#059669", fontWeight: 700 }}>{fmtTRY(t.amount)}</td>
                      <td className={styles.td} style={{ color: "#4f46e5", fontWeight: 700 }}>{fmtTRY(Math.round(t.amount * 0.10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 7 Günlük Dunning Aktivitesi */}
        <section className={`${styles.panel} ${styles.panelSpaced}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Son 7 Gün — Dunning Aktivitesi</h2>
            <span className={styles.count}>{dunningAttempts.length} deneme</span>
          </div>
          <div className={styles.chartWrap}>
            {chartDays.map((d, i) => (
              <div key={i} className={styles.chartCol}>
                <div className={styles.chartBarWrap}>
                  <div className={styles.chartBar} style={{ height: `${Math.round((d.value / chartMax) * 100)}%` }} />
                </div>
                <span className={styles.chartLabel}>{d.day}</span>
                {d.value > 0 && <span className={styles.chartValue}>{d.value}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Tenant Giriş Anahtarları */}
        <section className={`${styles.panel} ${styles.panelSpaced}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Tenant Giriş Anahtarları</h2>
            <span className={styles.count}>{tenants.length} tenant</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tenant Adı</th>
                  <th>Giriş Anahtarı</th>
                  <th>Webhook URL</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td className={styles.mono}>{t.loginKey}</td>
                    <td className={styles.mono} style={{ maxWidth: 240 }}>
                      {t.webhookUrl ? (
                        <span style={{ color: "#059669" }} title={t.webhookUrl}>
                          {t.webhookUrl.length > 40 ? t.webhookUrl.slice(0, 40) + "…" : t.webhookUrl}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <CopyPortalLink url={t.loginKey} />
                        <a href={`${appUrl}/tenant/dashboard`} target="_blank" rel="noreferrer" className={styles.btnLink}>Dashboard →</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Onboarding */}
        <section className={`${styles.panel} ${styles.panelSpaced}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Müşteri Onboarding</h2>
            <span className={styles.count}>{tenants.length} tenant</span>
          </div>
          <AdminClient tenants={tenants} />
        </section>

        {/* Abonelikler */}
        <section className={`${styles.panel} ${styles.panelSpaced}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Abonelikler</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={styles.count}>{subscriptions.length} kayıt</span>
              <a href="/api/admin/export" className={styles.btnLink} download>CSV İndir</a>
            </div>
          </div>

          {subscriptions.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Henüz abonelik yok</p>
              <p className={styles.emptyText}>Yukarıdan abonelik ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Müşteri</th>
                    <th>Plan</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Dunning</th>
                    <th>Pause Bitiş</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const lastAttempt = sub.dunningAttempts[0];
                    const canDunning  = sub.status === "PAST_DUE" || sub.status === "PAUSED";
                    const portalUrl   = `${appUrl}/?token=${sub.updateToken}`;
                    return (
                      <tr key={sub.id}>
                        <td>{sub.tenant.name}</td>
                        <td>
                          <div>{sub.customerPhone}</div>
                          {sub.customerEmail && <div className={styles.subText}>{sub.customerEmail}</div>}
                        </td>
                        <td>{sub.planName ?? "—"}</td>
                        <td className={styles.mono}>{formatAmount(sub.amount, sub.currency)}</td>
                        <td><StatusBadge status={sub.status} /></td>
                        <td className={styles.mono}>{lastAttempt ? `${lastAttempt.attemptNumber}. deneme` : "—"}</td>
                        <td className={styles.mono} style={{ fontSize: 12 }}>
                          {sub.pauseUntil ? sub.pauseUntil.toLocaleDateString("tr-TR") : "—"}
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <DunningButton subscriptionId={sub.id} disabled={!canDunning} />
                            <ResetDunningButton subscriptionId={sub.id} />
                            <CopyPortalLink url={portalUrl} />
                            <StatusChangeButton id={sub.id} current={sub.status} />
                            <DeleteSubscriptionButton id={sub.id} />
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

        {/* Analizler */}
        <section className={`${styles.panel} ${styles.insightsPanel}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>İptal Akışı Analizleri</h2>
            <span className={styles.count}>{cancellationEvents.length} tamamlanan akış</span>
          </div>
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>İptal Nedenleri</h3>
              <ul className={styles.insightList}>
                {reasonCounts.map((item) => (
                  <li key={item.label} className={styles.insightRow}>
                    <span className={styles.insightLabel}>{item.label}</span>
                    <span className={styles.insightValue}>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>Teklif Sonuçları</h3>
              <ul className={styles.insightList}>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>İndirim kabul edildi</span>
                  <span className={styles.insightValue}>{discountAccepted}</span>
                </li>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>Dondurma kabul edildi</span>
                  <span className={styles.insightValue}>{pauseAccepted}</span>
                </li>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>Plan düşürme kabul edildi</span>
                  <span className={styles.insightValue}>{downgradeAccepted}</span>
                </li>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>Yine de iptal</span>
                  <span className={`${styles.insightValue} ${styles.insightValueMuted}`}>{cancellationEvents.filter((e) => e.action === "CANCEL").length}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Audit Log */}
        <section className={`${styles.panel} ${styles.panelSpaced}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>İşlem Geçmişi</h2>
            <span className={styles.count}>son 30 kayıt</span>
          </div>
          {auditLogs.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Henüz kayıt yok.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Zaman</th>
                    <th>İşlem</th>
                    <th>Nesne</th>
                    <th>Aktör</th>
                    <th>Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const meta = log.metadata ? (() => { try { return JSON.parse(log.metadata) as Record<string, unknown>; } catch { return null; } })() : null;
                    return (
                      <tr key={log.id}>
                        <td className={styles.mono} style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                          {log.createdAt.toLocaleString("tr-TR")}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>
                          {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                        </td>
                        <td className={styles.mono} style={{ fontSize: 12 }}>
                          {log.entityType}<br />
                          <span style={{ color: "#94a3b8" }}>{log.entityId.slice(0, 12)}…</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>
                            {log.actorType}
                          </span>
                        </td>
                        <td className={styles.mono} style={{ fontSize: 12, color: "#6b7280" }}>
                          {meta ? Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join(" · ") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
