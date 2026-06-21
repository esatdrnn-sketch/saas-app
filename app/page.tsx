import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FailedPaymentsTable } from "@/components/dashboard/recent-transactions";
import { RecoveredRevenueChart } from "@/components/dashboard/order-chart";
import {
  DunningReminderCard,
  RecoveryProgressCard,
} from "@/components/dashboard/recovery-widgets";
import { StatsOverview } from "@/components/dashboard/stats-overview";

export default function HomePage() {
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

      <StatsOverview />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RecoveredRevenueChart />

        <div className="flex min-w-0 flex-col gap-6">
          <DunningReminderCard />
          <RecoveryProgressCard />
        </div>
      </section>

      <FailedPaymentsTable />
    </DashboardLayout>
  );
}
