import { cn } from "@/lib/utils";

export function RecoveryProgressCard() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Recovery Rate (%)</h3>
      <p className="mt-1 text-sm text-slate-500">
        Ödeme Kurtarma Başarı Oranı
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative flex size-40 items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeDasharray="8 10"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#2563eb"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${64 * 3.015} 999`}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-slate-900">%64</p>
            <p className="text-xs text-slate-500">Kurtarıldı</p>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-wrap justify-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600" />
            Kurtarıldı
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-slate-900" />
            Aktif Süreç
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-300" />
            Bekleyen
          </span>
        </div>
      </div>
    </section>
  );
}

export function DunningReminderCard() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Otomatik Hatırlatma</h3>
      <div className="mt-5 rounded-xl bg-slate-50 p-5">
        <h4 className="font-semibold text-slate-900">
          Failed Payment Follow-up
        </h4>
        <p className="mt-2 text-sm text-slate-500">
          Sonraki dunning e-postası: 14 reddedilen fatura için planlandı
        </p>
        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Kampanyayı Başlat
        </button>
      </div>
    </section>
  );
}
