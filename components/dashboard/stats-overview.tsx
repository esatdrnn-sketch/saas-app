import { ArrowDownRight, ArrowUpRight, CreditCard, Receipt, UtensilsCrossed, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Günlük Sipariş",
    value: "128",
    change: "+12.4%",
    trend: "up" as const,
    icon: Receipt,
  },
  {
    label: "Aktif Masalar",
    value: "18 / 24",
    change: "+3 masa",
    trend: "up" as const,
    icon: UtensilsCrossed,
  },
  {
    label: "Günlük Ciro",
    value: "₺42.850",
    change: "+8.1%",
    trend: "up" as const,
    icon: Wallet,
  },
  {
    label: "Bekleyen Ödeme",
    value: "6",
    change: "-2 adet",
    trend: "down" as const,
    icon: CreditCard,
  },
];

export function StatsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;

        return (
          <Card
            key={stat.label}
            className="border-slate-200 bg-white shadow-sm ring-0 rounded-none"
          >
            <CardContent className="flex items-start justify-between px-5 py-5">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600">
                  <TrendIcon className="size-3.5" />
                  {stat.change}
                </div>
              </div>
              <div className="flex size-11 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-none">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
