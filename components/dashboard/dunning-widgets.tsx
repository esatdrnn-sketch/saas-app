import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
};

export function StatCard({
  title,
  subtitle,
  value,
  change,
  trend,
  icon: Icon,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-rose-600"
        : "text-muted-foreground";

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 place-content-center rounded-lg bg-muted text-primary">
            <Icon className="size-5" />
          </div>
          <TrendIcon className={cn("size-4 shrink-0", trendColor)} />
        </div>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className={cn("mt-2 text-xs font-medium", trendColor)}>{change}</p>
      </CardContent>
    </Card>
  );
}

const weeklyRevenue = [
  { day: "Pzt", value: 12400, currency: "TRY" as const },
  { day: "Sal", value: 15800, currency: "TRY" as const },
  { day: "Çar", value: 11200, currency: "TRY" as const },
  { day: "Per", value: 420, currency: "USD" as const },
  { day: "Cum", value: 22100, currency: "TRY" as const },
  { day: "Cmt", value: 9800, currency: "TRY" as const },
  { day: "Paz", value: 310, currency: "USD" as const },
];

const maxValue = Math.max(...weeklyRevenue.map((item) => item.value));

function formatAmount(value: number, currency: "TRY" | "USD") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RecoveryChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Haftalık Kurtarılan Ciro Analizi</CardTitle>
        <CardDescription>
          Son 7 gün — TL ve USD bazında kurtarılan gelir (mock veri)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-3">
          {weeklyRevenue.map((item) => {
            const barHeight = Math.max(
              12,
              Math.round((item.value / maxValue) * 100)
            );

            return (
              <div
                key={item.day}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
                    style={{ height: `${barHeight}%` }}
                    title={formatAmount(item.value, item.currency)}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const failedPayments = [
  {
    customer: "Acme SaaS Ltd.",
    amount: "₺2.490",
    reason: "Yetersiz Bakiye",
    status: "1. E-posta Gönderildi",
    tone: "neutral" as const,
  },
  {
    customer: "Nova Analytics",
    amount: "$149",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    tone: "success" as const,
  },
  {
    customer: "Pixel Studio",
    amount: "₺890",
    reason: "Banka Reddi",
    status: "1. E-posta Gönderildi",
    tone: "neutral" as const,
  },
  {
    customer: "Flow Metrics",
    amount: "₺1.120",
    reason: "Yetersiz Bakiye",
    status: "İptal",
    tone: "danger" as const,
  },
  {
    customer: "Bright Labs",
    amount: "₺3.200",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    tone: "success" as const,
  },
];

function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone: "success" | "danger" | "neutral";
}) {
  const styles =
    tone === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : tone === "danger"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
        styles
      )}
    >
      {status}
    </span>
  );
}

export function FailedPaymentsTable() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Failed Payments &amp; Recovery Status</CardTitle>
        <CardDescription>
          Son reddedilen ödemeler ve kurtarılma durumları
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Müşteri</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Reddedilme Nedeni</TableHead>
                <TableHead className="pr-6">
                  Otomatik Hatırlatma Durumu
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedPayments.map((row) => (
                <TableRow key={`${row.customer}-${row.amount}`}>
                  <TableCell className="pl-6 font-medium">
                    {row.customer}
                  </TableCell>
                  <TableCell className="font-medium">{row.amount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.reason}
                  </TableCell>
                  <TableCell className="pr-6">
                    <StatusBadge status={row.status} tone={row.tone} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
