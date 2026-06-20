import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyOrders = [
  { day: "Pzt", value: 62 },
  { day: "Sal", value: 74 },
  { day: "Çar", value: 58 },
  { day: "Per", value: 91 },
  { day: "Cum", value: 112 },
  { day: "Cmt", value: 138 },
  { day: "Paz", value: 96 },
];

const maxValue = Math.max(...weeklyOrders.map((item) => item.value));

export function OrderChart() {
  return (
    <Card className="border-slate-200 bg-white shadow-sm ring-0 rounded-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4 rounded-none">
        <CardTitle className="text-base font-semibold text-slate-900">
          Haftalık Sipariş Grafiği
        </CardTitle>
        <p className="text-sm text-slate-500">
          Son 7 günün sipariş hacmi (mock veri)
        </p>
      </CardHeader>
      <CardContent className="px-5 py-6">
        <div className="grid h-64 grid-cols-7 items-end gap-3">
          {weeklyOrders.map((item) => {
            const height = `${Math.round((item.value / maxValue) * 100)}%`;

            return (
              <div key={item.day} className="flex h-full flex-col items-center">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-indigo-600 transition-all rounded-none"
                    style={{ height }}
                    title={`${item.value} sipariş`}
                  />
                </div>
                <span className="mt-3 text-xs font-medium text-slate-500">
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
