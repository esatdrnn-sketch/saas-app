export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FailedPaymentsTable } from "@/components/dashboard/recent-transactions";
import { RecoveredRevenueChart } from "@/components/dashboard/order-chart";
import { DunningReminderCard, RecoveryProgressCard } from "@/components/dashboard/recovery-widgets";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import type { ChartDay } from "@/components/dashboard/order-chart";
import type { SubscriptionRow } from "@/components/dashboard/recent-transactions";

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const DAY_SHORTS = ["P", "P", "S", "Ç", "P", "C", "C"];

async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [statusCounts, failedToday, recentSubs, dunningAttempts, autoCancelledCount] =
    await Promise.all([
      // Abonelik statü dağılımı
      prisma.subscription.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Bugün PAST_DUE olan abonelik sayısı
      prisma.subscription.count({
        where: { status: "PAST_DUE", updatedAt: { gte: todayStart } },
      }),
      // Son 10 aktif olmayan abonelik
      prisma.subscription.findMany({
        where: { status: { not: "ACTIVE" } },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          tenant: { select: { name: true } },
          dunningAttempts: {
            orderBy: { attemptNumber: "desc" },
            take: 1,
            select: { attemptNumber: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      // Son 7 günlük dunning denemesi aktivitesi
      prisma.dunningAttempt.findMany({
        where: { sentAt: { gte: sevenDaysAgo } },
        select: { sentAt: true },
      }),
      // 3 dunning denemesi tamamlanmış CANCELLED abonelikler (otomatik iptal)
      prisma.subscription.count({
        where: {
          status: "CANCELLED",
          dunningAttempts: { some: { attemptNumber: 3 } },
        },
      }),
    ]);

  // Status sayıları
  const counts: Record<string, number> = {};
  for (const row of statusCounts) {
    counts[row.status] = row._count.id;
  }
  const recoveredCount = counts["RECOVERED"] ?? 0;
  const cancelledCount = counts["CANCELLED"] ?? 0;
  const pastDueCount = counts["PAST_DUE"] ?? 0;
  const totalNonActive = recoveredCount + cancelledCount + pastDueCount;
  const recoveryRate =
    totalNonActive > 0
      ? Math.round((recoveredCount / totalNonActive) * 100)
      : 0;

  // Son 7 gün chart verisi
  const countsByDay: Record<string, number> = {};
  for (const attempt of dunningAttempts) {
    const key = attempt.sentAt.toISOString().slice(0, 10);
    countsByDay[key] = (countsByDay[key] ?? 0) + 1;
  }

  const chartDays: ChartDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const count = countsByDay[key] ?? 0;
    const dayIdx = d.getDay();
    return {
      label: key,
      day: DAY_SHORTS[dayIdx],
      label2: DAY_LABELS[dayIdx],
      value: count,
      count,
    };
  });

  // Tablo satırları
  const rows: SubscriptionRow[] = recentSubs.map((sub) => {
    const words = sub.tenant.name.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : sub.tenant.name.slice(0, 2).toUpperCase();

    return {
      id: sub.id,
      tenantName: sub.tenant.name,
      status: sub.status,
      lastAttempt: sub.dunningAttempts[0]?.attemptNumber ?? null,
      updatedAt: sub.updatedAt.toLocaleDateString("tr-TR"),
      initials,
    };
  });

  return {
    stats: { recoveredCount, failedToday, activeDunning: pastDueCount, recoveryRate, autoCancelled: autoCancelledCount },
    chartDays,
    rows,
    pendingCount: pastDueCount,
  };
}

export default async function DashboardPage() {
  const { stats, chartDays, rows, pendingCount } = await getDashboardData();

  return (
    <DashboardLayout>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-[#ecf7ef] px-3 py-1 text-xs font-semibold text-[#015021]">
            Overview
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dunning Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Başarısız abonelik ödemelerini izleyin, otomatik kurtarma
            kampanyalarını yönetin ve kurtarılan ciroyu tek ekrandan takip
            edin.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-[#015021] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#013a19]"
          >
            + Yeni Kampanya
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Rapor İndir
          </button>
        </div>
      </section>

      <StatsOverview data={stats} />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RecoveredRevenueChart days={chartDays} />
        <div className="flex min-w-0 flex-col gap-6">
          <DunningReminderCard pendingCount={pendingCount} />
          <RecoveryProgressCard rate={stats.recoveryRate} />
        </div>
      </section>

      <FailedPaymentsTable rows={rows} />
    </DashboardLayout>
  );
}
