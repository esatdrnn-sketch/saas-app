import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    status: "2. WhatsApp Hatırlatması",
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
    <Card className="border-slate-200 bg-white shadow-sm ring-0 rounded-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4 rounded-none">
        <CardTitle className="text-base font-semibold text-slate-900">
          Recent Failed Payments &amp; Recovery Status
        </CardTitle>
        <p className="text-sm text-slate-500">
          Son reddedilen ödemeler ve otomatik hatırlatma durumları
        </p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="px-5 text-slate-500">Müşteri</TableHead>
              <TableHead className="text-slate-500">Tutar</TableHead>
              <TableHead className="text-slate-500">
                Reddedilme Nedeni
              </TableHead>
              <TableHead className="px-5 text-slate-500">
                Otomatik Hatırlatma Durumu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failedPayments.map((row) => (
              <TableRow
                key={`${row.customer}-${row.amount}`}
                className="border-slate-200"
              >
                <TableCell className="px-5 font-medium text-slate-900">
                  {row.customer}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {row.amount}
                </TableCell>
                <TableCell className="text-slate-600">{row.reason}</TableCell>
                <TableCell className="px-5">
                  <Badge
                    variant={row.statusVariant}
                    className="rounded-none"
                  >
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
