import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OrderChart } from "@/components/dashboard/order-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
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
            <div className="mb-4">
              <p className="text-sm font-medium text-indigo-600">
                Genel Bakış
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Restoran operasyonlarınızı, sipariş akışını ve ödeme durumunu
                tek ekrandan takip edin.
              </p>
            </div>
            <StatsOverview />
          </section>

          <section>
            <OrderChart />
          </section>

          <section>
            <RecentTransactions />
          </section>
        </main>
      </div>
    </div>
  );
}
