import { ArrowUpRight, CreditCard, Percent, RefreshCw, Wallet } from "lucide-react";

const stats = [
  {
    label: "Recovered Revenue",
    sublabel: "Kurtarılan Toplam Ciro",
    value: "₺128.400",
    change: "+18.2% bu ay",
    icon: Wallet,
    featured: true,
  },
  {
    label: "Failed Invoices Today",
    sublabel: "Bugün Reddedilen Faturalar",
    value: "14",
    change: "+3 dünden",
    icon: CreditCard,
  },
  {
    label: "Active Dunning Campaigns",
    sublabel: "Aktif Kurtarma Süreçleri",
    value: "6",
    change: "2 yeni başlatıldı",
    icon: RefreshCw,
  },
  {
    label: "Recovery Rate (%)",
    sublabel: "Ödeme Kurtarma Başarı Oranı",
    value: "%64",
    change: "+4.1 puan",
    icon: Percent,
  },
];

export function StatsOverview() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        if (stat.featured) {
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 text-white shadow-sm"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="grid size-10 place-content-center rounded-xl bg-white/15">
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
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="grid size-10 place-content-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="mt-1 text-[11px] text-slate-400">{stat.sublabel}</p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-3 text-xs text-slate-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
