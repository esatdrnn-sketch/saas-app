import { cn } from "@/lib/utils";

const failedPayments = [
  {
    customer: "Acme SaaS Ltd.",
    amount: "₺2.490",
    reason: "Yetersiz Bakiye",
    status: "1. E-posta Gönderildi",
    tone: "pending" as const,
    initials: "AS",
    color: "bg-orange-100 text-orange-700",
  },
  {
    customer: "Nova Analytics",
    amount: "$149",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    tone: "success" as const,
    initials: "NA",
    color: "bg-blue-100 text-blue-700",
  },
  {
    customer: "Pixel Studio",
    amount: "₺890",
    reason: "Banka Reddi",
    status: "1. E-posta Gönderildi",
    tone: "pending" as const,
    initials: "PS",
    color: "bg-sky-100 text-sky-700",
  },
  {
    customer: "Flow Metrics",
    amount: "₺1.120",
    reason: "Yetersiz Bakiye",
    status: "İptal",
    tone: "danger" as const,
    initials: "FM",
    color: "bg-violet-100 text-violet-700",
  },
  {
    customer: "Bright Labs",
    amount: "₺3.200",
    reason: "Süresi Dolan Kart",
    status: "Kurtarıldı",
    tone: "success" as const,
    initials: "BL",
    color: "bg-amber-100 text-amber-700",
  },
];

function statusClass(tone: "success" | "pending" | "danger") {
  if (tone === "success") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (tone === "danger") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function FailedPaymentsTable() {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Recent Failed Payments &amp; Recovery Status
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Son reddedilen ödemeler ve kurtarılma durumları
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          + Yeni Kayıt
        </button>
      </div>

      <div className="space-y-3">
        {failedPayments.map((row) => (
          <div
            key={`${row.customer}-${row.amount}`}
            className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className={cn(
                  "grid size-12 shrink-0 place-content-center rounded-xl text-sm font-bold",
                  row.color
                )}
              >
                {row.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {row.customer}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {row.reason} · {row.amount}
                </p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex w-fit shrink-0 rounded-lg border px-3 py-1 text-xs font-semibold",
                statusClass(row.tone)
              )}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
