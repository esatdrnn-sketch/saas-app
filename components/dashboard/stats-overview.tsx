import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Percent,
  RefreshCw,
  Wallet,
} from "lucide-react";

const stats = [
  {
    label: "Recovered Revenue",
    sublabel: "Kurtarılan Toplam Ciro",
    value: "₺128.400",
    change: "+18.2% bu ay",
    trend: "up" as const,
    icon: Wallet,
    iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Failed Invoices Today",
    sublabel: "Bugün Reddedilen Faturalar",
    value: "14",
    change: "+3 dünden",
    trend: "down" as const,
    icon: CreditCard,
    iconBg: "bg-rose-50 dark:bg-rose-900/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Active Dunning Campaigns",
    sublabel: "Aktif Kurtarma Süreçleri",
    value: "6",
    change: "2 yeni başlatıldı",
    trend: "up" as const,
    icon: RefreshCw,
    iconBg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Recovery Rate (%)",
    sublabel: "Ödeme Kurtarma Başarı Oranı",
    value: "%64",
    change: "+4.1 puan",
    trend: "up" as const,
    icon: Percent,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

export function StatsOverview() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const trendColor =
          stat.trend === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400";

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <Icon className={`size-5 ${stat.iconColor}`} />
              </div>
              <TrendIcon className={`size-4 ${trendColor}`} />
            </div>

            <h3 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {stat.label}
            </h3>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-500">
              {stat.sublabel}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
            <p className={`mt-1 text-sm ${trendColor}`}>{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
