import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const failedPayments = [
  {
    customer: "Acme SaaS Ltd.",
    amount: "₺2.490",
    reason: "Yetersiz Bakiye",
    status: "1. E-posta Gönderildi",
    statusVariant: "secondary" as const,
  },
  {
    customer: "Nova Analytics",
    amount: "$149",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    statusVariant: "default" as const,
  },
  {
    customer: "Pixel Studio",
    amount: "₺890",
    reason: "Banka Reddi",
    status: "1. E-posta Gönderildi",
    statusVariant: "secondary" as const,
  },
  {
    customer: "Flow Metrics",
    amount: "₺1.120",
    reason: "Yetersiz Bakiye",
    status: "İptal",
    statusVariant: "destructive" as const,
  },
  {
    customer: "Bright Labs",
    amount: "₺3.200",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    statusVariant: "default" as const,
  },
];

export function FailedPaymentsTable() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">
          Recent Failed Payments &amp; Recovery Status
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Son reddedilen ödemeler ve kurtarılma durumları
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="px-6 text-slate-500">Müşteri</TableHead>
              <TableHead className="text-slate-500">Tutar</TableHead>
              <TableHead className="text-slate-500">
                Reddedilme Nedeni
              </TableHead>
              <TableHead className="px-6 text-slate-500">
                Otomatik Hatırlatma Durumu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failedPayments.map((row) => (
              <TableRow
                key={`${row.customer}-${row.amount}`}
                className="border-slate-100 transition-colors hover:bg-slate-50/80"
              >
                <TableCell className="px-6 font-medium text-slate-900">
                  {row.customer}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {row.amount}
                </TableCell>
                <TableCell className="text-slate-600">{row.reason}</TableCell>
                <TableCell className="px-6">
                  <Badge variant={row.statusVariant}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
