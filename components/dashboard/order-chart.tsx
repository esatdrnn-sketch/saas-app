import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyRevenue = [
  { day: "Pzt", value: 12400 },
  { day: "Sal", value: 15800 },
  { day: "Çar", value: 11200 },
  { day: "Per", value: 18600 },
  { day: "Cum", value: 22100 },
  { day: "Cmt", value: 9800 },
  { day: "Paz", value: 14300 },
];

const maxValue = Math.max(...weeklyRevenue.map((item) => item.value));

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RecoveredRevenueChart() {
  return (
    <Card className="border-slate-200 bg-white shadow-sm ring-0 rounded-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4 rounded-none">
        <CardTitle className="text-base font-semibold text-slate-900">
          Haftalık Kurtarılan Ciro Analizi
        </CardTitle>
        <p className="text-sm text-slate-500">
          Son 7 gün — kurtarılan abonelik geliri (TL, mock veri)
        </p>
      </CardHeader>
      <CardContent className="px-5 py-6">
        <div className="mb-4 grid grid-cols-4 gap-3 border border-slate-100 bg-slate-50 p-3 sm:grid-cols-7 rounded-none">
          {weeklyRevenue.map((item) => (
            <div key={item.day} className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {item.day}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid h-56 grid-cols-7 items-end gap-3 border border-slate-100 bg-white p-4 rounded-none">
          {weeklyRevenue.map((item) => {
            const height = `${Math.round((item.value / maxValue) * 100)}%`;

            return (
              <div key={`bar-${item.day}`} className="flex h-full flex-col items-center">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-indigo-600 rounded-none"
                    style={{ height }}
                    title={formatCurrency(item.value)}
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
