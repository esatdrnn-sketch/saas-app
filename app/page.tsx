"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  FailedPaymentsTable,
  RecoveryChart,
  StatCard,
} from "@/components/dashboard/dunning-widgets";
import { CreditCard, Percent, RefreshCw, Wallet } from "lucide-react";

const stats = [
  {
    title: "Recovered Revenue",
    subtitle: "Kurtarılan Toplam Ciro",
    value: "₺128.400",
    change: "+18.2% bu ay",
    trend: "up" as const,
    icon: Wallet,
  },
  {
    title: "Failed Invoices Today",
    subtitle: "Bugün Reddedilen Faturalar",
    value: "14",
    change: "+3 dünden",
    trend: "down" as const,
    icon: CreditCard,
  },
  {
    title: "Active Dunning Campaigns",
    subtitle: "Aktif Kurtarma Süreçleri",
    value: "6",
    change: "2 yeni başlatıldı",
    trend: "neutral" as const,
    icon: RefreshCw,
  },
  {
    title: "Recovery Rate (%)",
    subtitle: "Ödeme Kurtarma Başarı Oranı",
    value: "%64",
    change: "+4.1 puan",
    trend: "up" as const,
    icon: Percent,
  },
];

function DunningDashboardInner() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Overview
        </span>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Dunning Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
          Başarısız abonelik ödemelerini izleyin, otomatik kurtarma
          kampanyalarını yönetin ve kurtarılan ciroyu tek ekrandan takip edin.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mb-8 md:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mb-6 md:mb-8">
        <RecoveryChart />
      </div>

      <FailedPaymentsTable />
    </div>
  );
}

export default function DunningDashboard() {
  return (
    <DashboardLayout>
      <DunningDashboardInner />
    </DashboardLayout>
  );
}
