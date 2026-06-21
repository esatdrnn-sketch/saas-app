import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FailedPaymentsTable } from "@/components/dashboard/recent-transactions";
import { RecoveredRevenueChart } from "@/components/dashboard/order-chart";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StatsOverview } from "@/components/dashboard/stats-overview";

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <SidebarNav />

      <div className="flex min-w-0 flex-1 flex-col pl-64">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <section>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Overview
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Dunning Dashboard
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                Başarısız abonelik ödemelerini izleyin, otomatik kurtarma
                kampanyalarını yönetin ve kurtarılan ciroyu tek ekrandan takip
                edin.
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
          </div>
        </main>
      </div>
    </div>
  );
}
