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

export function RecoveredRevenueChart() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Haftalık Kurtarılan Ciro Analizi
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Son 7 gün — TL ve USD bazında kurtarılan gelir (mock veri)
        </p>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-1">
          {weeklyRevenue.map((item) => (
            <div
              key={`summary-${item.day}`}
              className="rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {item.day}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatAmount(item.value, item.currency)}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid h-52 grid-cols-7 items-end gap-3">
            {weeklyRevenue.map((item) => {
              const barHeight = Math.max(
                12,
                Math.round((item.value / maxValue) * 100)
              );

              return (
                <div
                  key={`bar-${item.day}`}
                  className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-40 w-full items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-indigo-700 hover:to-indigo-500"
                      style={{ height: `${barHeight}%` }}
                      title={formatAmount(item.value, item.currency)}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
