import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FailedPaymentsTable } from "@/components/dashboard/recent-transactions";
import { RecoveredRevenueChart } from "@/components/dashboard/order-chart";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StatsOverview } from "@/components/dashboard/stats-overview";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <SidebarNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 space-y-6 p-6">
          <section>
            <div className="mb-5">
              <p className="text-sm font-medium text-indigo-600">Overview</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Churn Recovery Dashboard
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Başarısız ödemeleri izleyin, dunning kampanyalarını yönetin ve
                kurtarılan ciroyu tek ekrandan takip edin.
              </p>
            </div>
            <StatsOverview />
          </section>

          <section className="grid gap-6">
            <RecoveredRevenueChart />
          </section>

          <section>
            <FailedPaymentsTable />
          </section>
        </main>
      </div>
    </div>
  );
}
