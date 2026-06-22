import { cn } from "@/lib/utils";

export interface SubscriptionRow {
  id: string;
  tenantName: string;
  status: string;
  lastAttempt: number | null;
  updatedAt: string;
  initials: string;
}

const STATUS_LABELS: Record<string, { label: string; tone: "success" | "pending" | "danger" | "neutral" }> = {
  RECOVERED: { label: "Kurtarıldı", tone: "success" },
  PAST_DUE:  { label: "Ödeme Bekliyor", tone: "pending" },
  CANCELLED: { label: "İptal", tone: "danger" },
  PAUSED:    { label: "Donduruldu", tone: "neutral" },
  ACTIVE:    { label: "Aktif", tone: "success" },
};

function statusClass(tone: "success" | "pending" | "danger" | "neutral") {
  if (tone === "success") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (tone === "danger")  return "bg-red-50 text-red-700 border-red-200";
  if (tone === "neutral") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export function FailedPaymentsTable({ rows }: { rows: SubscriptionRow[] }) {
  return (
    <section className="min-w-0 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Recent Failed Payments &amp; Recovery Status
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Son reddedilen ödemeler ve kurtarılma durumları
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">Henüz başarısız ödeme kaydı yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => {
            const statusInfo = STATUS_LABELS[row.status] ?? { label: row.status, tone: "neutral" as const };
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-[22px] border border-slate-100 bg-[#fcfdfc] p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className={cn("grid size-12 shrink-0 place-content-center rounded-full text-sm font-bold", avatarColor)}>
                    {row.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{row.tenantName}</p>
                    <p className="truncate text-sm text-slate-500">
                      {row.lastAttempt ? `${row.lastAttempt}. e-posta gönderildi` : "E-posta gönderilmedi"}{" "}
                      · {row.updatedAt}
                    </p>
                  </div>
                </div>
                <span className={cn("inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold", statusClass(statusInfo.tone))}>
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
