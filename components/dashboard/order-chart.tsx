const weeklyRevenue = [
  { day: "P", label: "Pzt", value: 62, amount: "₺12.400", currency: "TRY" as const },
  { day: "S", label: "Sal", value: 84, amount: "₺15.800", currency: "TRY" as const },
  { day: "M", label: "Çar", value: 58, amount: "₺11.200", currency: "TRY" as const },
  { day: "T", label: "Per", value: 72, amount: "$420", currency: "USD" as const },
  { day: "W", label: "Cum", value: 92, amount: "₺22.100", currency: "TRY" as const },
  { day: "T", label: "Cmt", value: 48, amount: "₺9.800", currency: "TRY" as const },
  { day: "S", label: "Paz", value: 66, amount: "$310", currency: "USD" as const },
];

export function RecoveredRevenueChart() {
  const average = Math.round(
    weeklyRevenue.reduce((sum, item) => sum + item.value, 0) /
      weeklyRevenue.length
  );
  const peak = Math.max(...weeklyRevenue.map((item) => item.value));

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Haftalık Kurtarılan Ciro Analizi
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Son 7 gün — TL ve USD bazında kurtarılan gelir (mock veri)
          </p>
        </div>
        <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
          Weekly Activity
        </span>
      </div>

      <div className="relative h-56">
        <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between text-[11px] text-slate-300">
          {[100, 80, 60, 40, 20, 0].map((tick) => (
            <div key={tick} className="flex items-center gap-3">
              <span className="w-6 text-right">{tick}</span>
              <div className="h-px flex-1 border-t border-dashed border-slate-200" />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 ml-8 flex h-[calc(100%-12px)] items-end justify-between gap-2 sm:gap-4">
          {weeklyRevenue.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3"
            >
              <div
                className="w-full max-w-12 rounded-t-xl rounded-b-md transition-all"
                style={{ height: `${item.value}%` }}
                title={item.amount}
              >
                <div
                  className={
                    index % 2 === 0
                      ? "size-full rounded-t-xl bg-blue-600"
                      : "size-full rounded-t-xl bg-blue-300"
                  }
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-700">
          Average: <span className="text-blue-600">{average}%</span>
        </span>
        <span className="font-medium text-slate-700">
          Peak: <span className="text-blue-600">{peak}%</span>
        </span>
      </div>
    </section>
  );
}
