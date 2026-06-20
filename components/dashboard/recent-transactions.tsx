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

const transactions = [
  {
    id: "SP-1042",
    table: "Masa 12",
    amount: "₺1.240",
    payment: "iyzico",
    status: "Tamamlandı",
    time: "14:32",
  },
  {
    id: "SP-1041",
    table: "Masa 07",
    amount: "₺860",
    payment: "Nakit",
    status: "Tamamlandı",
    time: "14:18",
  },
  {
    id: "SP-1040",
    table: "Masa 03",
    amount: "₺2.150",
    payment: "iyzico",
    status: "Bekliyor",
    time: "13:55",
  },
  {
    id: "SP-1039",
    table: "Masa 18",
    amount: "₺540",
    payment: "iyzico",
    status: "Başarısız",
    time: "13:41",
  },
  {
    id: "SP-1038",
    table: "Masa 05",
    amount: "₺980",
    payment: "Kart",
    status: "Tamamlandı",
    time: "13:12",
  },
];

function statusVariant(status: string) {
  if (status === "Tamamlandı") return "default" as const;
  if (status === "Bekliyor") return "secondary" as const;
  return "destructive" as const;
}

export function RecentTransactions() {
  return (
    <Card className="border-slate-200 bg-white shadow-sm ring-0 rounded-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4 rounded-none">
        <CardTitle className="text-base font-semibold text-slate-900">
          Son İşlemler
        </CardTitle>
        <p className="text-sm text-slate-500">
          En son tamamlanan ve bekleyen sipariş hareketleri
        </p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="px-5 text-slate-500">Sipariş No</TableHead>
              <TableHead className="text-slate-500">Masa</TableHead>
              <TableHead className="text-slate-500">Tutar</TableHead>
              <TableHead className="text-slate-500">Ödeme</TableHead>
              <TableHead className="text-slate-500">Durum</TableHead>
              <TableHead className="px-5 text-right text-slate-500">
                Saat
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((row) => (
              <TableRow key={row.id} className="border-slate-200">
                <TableCell className="px-5 font-medium text-slate-900">
                  {row.id}
                </TableCell>
                <TableCell className="text-slate-600">{row.table}</TableCell>
                <TableCell className="font-medium text-slate-900">
                  {row.amount}
                </TableCell>
                <TableCell className="text-slate-600">{row.payment}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(row.status)}
                    className="rounded-none"
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 text-right text-slate-500">
                  {row.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
