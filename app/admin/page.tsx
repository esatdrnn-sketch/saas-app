import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";
import { CANCEL_REASON_LABELS, CANCEL_REASON_ORDER } from "@/lib/cancellation";
import styles from "./admin.module.css";
import LogoutButton from "./LogoutButton";
import AdminClient from "./AdminClient";
import DunningButton from "./DunningButton";
import CopyPortalLink from "./CopyPortalLink";

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

export default async function AdminPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [subscriptions, cancellationEvents, tenants, failedToday, dunningAttempts, autoCancelledCount] =
    await Promise.all([
      prisma.subscription.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          tenant: { select: { name: true } },
          dunningAttempts: { orderBy: { attemptNumber: "desc" }, take: 1 },
        },
      }),
      prisma.cancellationEvent.findMany({ select: { reason: true, action: true } }),
      prisma.tenant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, loginKey: true } }),
      prisma.subscription.count({ where: { status: "PAST_DUE", updatedAt: { gte: todayStart } } }),
      prisma.dunningAttempt.findMany({ where: { sentAt: { gte: sevenDaysAgo } }, select: { sentAt: true } }),
      prisma.subscription.count({
        where: { status: "CANCELLED", dunningAttempts: { some: { attemptNumber: 3 } } },
      }),
    ]);

  const pastDueCount   = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const recoveredCount = subscriptions.filter((s) => s.status === "RECOVERED").length;
  const recoveryRate   = (pastDueCount + recoveredCount) > 0
    ? Math.round((recoveredCount / (pastDueCount + recoveredCount)) * 100)
    : 0;

  const reasonCounts = CANCEL_REASON_ORDER.map((reason) => ({
    label: CANCEL_REASON_LABELS[reason],
    count: cancellationEvents.filter((e) => e.reason === reason).length,
  }));

  const discountAccepted = cancellationEvents.filter((e) => e.action === "ACCEPT_DISCOUNT").length;
  const pauseAccepted    = cancellationEvents.filter((e) => e.action === "ACCEPT_PAUSE").length;
  const declinedOffer    = cancellationEvents.filter(
    (e) => e.action === "CANCEL" && (e.reason === "TOO_EXPENSIVE" || e.reason === "TEMPORARY")
  ).length;

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
            <p className={styles.brand}>RecoverPanel</p>
            <h1 className={styles.heading}>Yönetim Paneli</h1>
          </div>
          <LogoutButton />
        </header>

        {/* Stats — 5 kart */}
        <div className={styles.statsGrid5}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Kurtarma Oranı</p>
            <p className={styles.statValue}>%{recoveryRate}</p>
            <p className={styles.statHint}>{recoveredCount} kurtarıldı · {pastDueCount} başarısız</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Toplam Abonelik</p>
            <p className={styles.statValue}>{subscriptions.length}</p>
            <p className={styles.statHint}>{tenants.length} tenant</p>
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
                  <div
                    className={styles.chartBar}
                    style={{ height: `${Math.round((d.value / chartMax) * 100)}%` }}
                  />
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
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td className={styles.mono}>{t.loginKey}</td>
                    <td>
                      <div className={styles.actionCell}>
                        <CopyPortalLink url={t.loginKey} />
                        <a
                          href={`${appUrl}/tenant/dashboard`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.btnLink}
                        >
                          Dashboard →
                        </a>
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
            <span className={styles.count}>{subscriptions.length} kayıt</span>
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
                          {sub.customerEmail && (
                            <div className={styles.subText}>{sub.customerEmail}</div>
                          )}
                        </td>
                        <td>{sub.planName ?? "—"}</td>
                        <td className={styles.mono}>
                          {formatAmount(sub.amount, sub.currency)}
                        </td>
                        <td><StatusBadge status={sub.status} /></td>
                        <td className={styles.mono}>
                          {lastAttempt ? `${lastAttempt.attemptNumber}. deneme` : "—"}
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <DunningButton subscriptionId={sub.id} disabled={!canDunning} />
                            <CopyPortalLink url={portalUrl} />
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
                  <span className={styles.insightLabel}>Yine de iptal</span>
                  <span className={`${styles.insightValue} ${styles.insightValueMuted}`}>
                    {declinedOffer}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
