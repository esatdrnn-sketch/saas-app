import { ArrowUpRight, CreditCard, Percent, RefreshCw, Wallet, XCircle } from "lucide-react";

export interface StatsData {
  recoveredCount: number;
  failedToday: number;
  activeDunning: number;
  recoveryRate: number;
  autoCancelled: number;
}

export function StatsOverview({ data }: { data: StatsData }) {
  const stats = [
    {
      label: "Recovered Subscriptions",
      sublabel: "Kurtarılan Abonelik",
      value: data.recoveredCount.toString(),
      change: "Toplam kurtarılan",
      icon: Wallet,
      featured: true,
    },
    {
      label: "Failed Today",
      sublabel: "Bugün Başarısız Ödeme",
      value: data.failedToday.toString(),
      change: "Son 24 saat",
      icon: CreditCard,
    },
    {
      label: "Active Dunning",
      sublabel: "Aktif Kurtarma Süreci",
      value: data.activeDunning.toString(),
      change: "PAST_DUE abonelik",
      icon: RefreshCw,
    },
    {
      label: "Recovery Rate",
      sublabel: "Ödeme Kurtarma Oranı",
      value: `%${data.recoveryRate}`,
      change: "Kurtarılan / toplam",
      icon: Percent,
    },
    {
      label: "Auto Cancelled",
      sublabel: "Otomatik İptal",
      value: data.autoCancelled.toString(),
      change: "3. deneme → iptal",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        if (i === 0) {
          return (
            <div key={stat.label} className="relative overflow-hidden rounded-[28px] bg-[#015021] p-6 text-white shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div className="grid size-10 place-content-center rounded-full bg-white/15">
                  <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-white/80" />
              </div>
              <p className="text-sm font-medium text-white/85">{stat.label}</p>
              <p className="mt-1 text-[11px] text-white/65">{stat.sublabel}</p>
              <p className="mt-4 text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-3 text-xs text-white/75">{stat.change}</p>
            </div>
          );
        }
        return (
          <div key={stat.label} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <div className="grid size-10 place-content-center rounded-full bg-[#ecf7ef] text-[#015021]">
                <Icon className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-[#015021]" />
            </div>
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="mt-1 text-[11px] text-slate-400">{stat.sublabel}</p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-3 text-xs text-slate-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
