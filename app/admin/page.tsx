import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";
import {
  CANCEL_REASON_LABELS,
  CANCEL_REASON_ORDER,
} from "@/lib/cancellation";
import styles from "./admin.module.css";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  PAST_DUE: { label: "PAST_DUE", className: styles.pastDue },
  RECOVERED: { label: "RECOVERED", className: styles.recovered },
  ACTIVE: { label: "ACTIVE", className: styles.active },
  PAUSED: { label: "PAUSED", className: styles.paused },
  CANCELLED: { label: "CANCELLED", className: styles.cancelled },
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = statusConfig[status];

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  );
}

export default async function AdminPage() {
  const [subscriptions, cancellationEvents] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { updatedAt: "desc" },
    }),
    prisma.cancellationEvent.findMany({
      select: { reason: true, action: true },
    }),
  ]);

  const pastDueCount = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const recoveredCount = subscriptions.filter((s) => s.status === "RECOVERED").length;
  const recoveryDenominator = pastDueCount + recoveredCount;
  const recoveryRate =
    recoveryDenominator > 0
      ? Math.round((recoveredCount / recoveryDenominator) * 100)
      : 0;

  const reasonCounts = CANCEL_REASON_ORDER.map((reason) => ({
    label: CANCEL_REASON_LABELS[reason],
    count: cancellationEvents.filter((event) => event.reason === reason).length,
  }));

  const discountAccepted = cancellationEvents.filter(
    (event) => event.action === "ACCEPT_DISCOUNT"
  ).length;
  const pauseAccepted = cancellationEvents.filter(
    (event) => event.action === "ACCEPT_PAUSE"
  ).length;
  const declinedOffer = cancellationEvents.filter(
    (event) =>
      event.action === "CANCEL" &&
      (event.reason === "TOO_EXPENSIVE" || event.reason === "TEMPORARY")
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <p className={styles.brand}>Churn Recovery</p>
          <h1 className={styles.heading}>Kurtarma Paneli</h1>
          <LogoutButton />
        </header>

        <section className={styles.hero} aria-label="Kurtarma oranı">
          <p className={styles.heroLabel}>Kurtarma Oranı</p>
          <p className={styles.heroValue}>%{recoveryRate}</p>
          <p className={styles.heroHint}>
            {recoveredCount} kurtarıldı · {pastDueCount} ödeme başarısız
          </p>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Abonelikler</h2>
            <span className={styles.count}>{subscriptions.length} kayıt</span>
          </div>

          {subscriptions.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Henüz abonelik yok</p>
              <p className={styles.emptyText}>
                iyzico webhook ile gelen kayıtlar burada listelenecek.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Müşteri Telefonu</th>
                    <th>iyzico Referans Kodu</th>
                    <th>updateToken</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>{subscription.customerPhone}</td>
                      <td>
                        <span className={styles.mono}>
                          {subscription.iyzicoSubRef ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.mono}>
                          {subscription.updateToken}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={subscription.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={`${styles.panel} ${styles.insightsPanel}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>İptal Akışı Analizleri</h2>
            <span className={styles.count}>
              {cancellationEvents.length} tamamlanan akış
            </span>
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
                  <span className={styles.insightLabel}>
                    İndirim teklifi kabul edildi
                  </span>
                  <span className={styles.insightValue}>{discountAccepted}</span>
                </li>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>
                    Dondurma teklifi kabul edildi
                  </span>
                  <span className={styles.insightValue}>{pauseAccepted}</span>
                </li>
                <li className={styles.insightRow}>
                  <span className={styles.insightLabel}>
                    Yine de iptal et
                  </span>
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
