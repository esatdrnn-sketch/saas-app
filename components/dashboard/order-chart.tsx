export interface ChartDay {
  label: string;
  day: string;
  value: number;
  count: number;
}

export function RecoveredRevenueChart({ days }: { days: ChartDay[] }) {
  const peak = Math.max(...days.map((d) => d.value), 1);
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <section className="min-w-0 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Haftalık Dunning Aktivitesi
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Son 7 gün — gönderilen dunning e-postası sayısı
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
          {days.map((item, index) => {
            const heightPct = peak > 0 ? Math.round((item.value / peak) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3"
              >
                <div
                  className="w-full max-w-12 rounded-t-[18px] rounded-b-md transition-all"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                  title={`${item.count} e-posta`}
                >
                  <div
                    className={
                      index % 2 === 0
                        ? "size-full rounded-t-[18px] bg-[#015021]"
                        : "size-full rounded-t-[18px] bg-[#7ed957]"
                    }
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-700">
          Toplam: <span className="text-[#015021]">{total} e-posta</span>
        </span>
        <span className="font-medium text-slate-700">
          Zirve: <span className="text-[#015021]">{peak} / gün</span>
        </span>
      </div>
    </section>
  );
}
