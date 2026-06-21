import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FailedPaymentsTable } from "@/components/dashboard/recent-transactions";
import { RecoveredRevenueChart } from "@/components/dashboard/order-chart";
import { StatsOverview } from "@/components/dashboard/stats-overview";

export default function HomePage() {
  return (
    <DashboardLayout>
      <section>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          Overview
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Dunning Dashboard
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Başarısız abonelik ödemelerini izleyin, otomatik kurtarma
          kampanyalarını yönetin ve kurtarılan ciroyu tek ekrandan takip edin.
        </p>
      </section>

      <section>
        <StatsOverview />
      </section>

      <section>
        <RecoveredRevenueChart />
      </section>

      <section>
        <FailedPaymentsTable />
      </section>
    </DashboardLayout>
  );
}
