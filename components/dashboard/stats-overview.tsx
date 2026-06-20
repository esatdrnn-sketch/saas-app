import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Percent,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Recovered Revenue",
    sublabel: "Kurtarılan Toplam Ciro",
    value: "₺128.400",
    change: "+18.2% bu ay",
    trend: "up" as const,
    icon: Wallet,
  },
  {
    label: "Failed Invoices Today",
    sublabel: "Bugün Reddedilen Faturalar",
    value: "14",
    change: "+3 dünden",
    trend: "down" as const,
    icon: CreditCard,
  },
  {
    label: "Active Dunning Campaigns",
    sublabel: "Aktif Kurtarma Süreçleri",
    value: "6",
    change: "2 yeni başlatıldı",
    trend: "up" as const,
    icon: RefreshCw,
  },
  {
    label: "Recovery Rate",
    sublabel: "Ödeme Kurtarma Başarı Oranı",
    value: "%64",
    change: "+4.1 puan",
    trend: "up" as const,
    icon: Percent,
  },
];

export function StatsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const trendColor =
          stat.trend === "up" ? "text-emerald-600" : "text-rose-600";

        return (
          <Card
            key={stat.label}
            className="border-slate-200 bg-white shadow-sm ring-0 rounded-none"
          >
            <CardContent className="px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {stat.sublabel}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <div
                    className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}
                  >
                    <TrendIcon className="size-3.5" />
                    {stat.change}
                  </div>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-none">
                  <Icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
