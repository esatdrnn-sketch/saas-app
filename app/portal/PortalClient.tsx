"use client";

import { useState } from "react";
import type { SubscriptionStatus } from "@prisma/client";

type Tab = "cancel" | "card";
type CancelReason = "too_expensive" | "technical" | "temporary" | "alternative";
type CancelStep = "survey" | "offer" | "confirm" | "done";
type ResultAction = "accept_discount" | "accept_pause" | "cancel";

const REASONS: { id: CancelReason; label: string; desc: string }[] = [
  { id: "too_expensive", label: "Çok pahalı", desc: "Fiyatlandırma bütçemi aşıyor" },
  { id: "technical", label: "Teknik sorunlar yaşıyorum", desc: "Ürün beklediğim gibi çalışmıyor" },
  { id: "temporary", label: "Geçici olarak ihtiyacım yok", desc: "Şu an kullanmıyorum ama geri dönebilirim" },
  { id: "alternative", label: "Başka bir alternatif buldum", desc: "Farklı bir çözüme geçiyorum" },
];

interface Props {
  token: string;
  tenantName: string;
  subscriptionStatus: SubscriptionStatus;
  planName?: string;
  amount?: number;
  currency?: string;
}

export default function PortalClient({ token, tenantName, subscriptionStatus, planName, amount, currency = "TRY" }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(subscriptionStatus === "PAST_DUE" ? "card" : "cancel");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RP</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">RecoverPanel</span>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Güvenli bağlantı
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">
        {/* PAST_DUE uyarı banner */}
        {subscriptionStatus === "PAST_DUE" && (
          <div className="mb-6 border-l-4 border-red-500 bg-red-50 px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-800">Ödemeniz başarısız oldu</p>
              <p className="text-xs text-red-700 mt-0.5">
                Aboneliğinizin devam edebilmesi için kart bilgilerinizi güncellemeniz gerekiyor.
              </p>
            </div>
          </div>
        )}

        {/* Tenant info */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Abonelik Yönetimi</p>
          <h1 className="text-2xl font-bold text-slate-900">{tenantName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aboneliğinizi yönetmek için aşağıdaki seçeneklerden birini kullanın.
          </p>
          {(planName || amount) && (
            <div className="mt-4 flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
              {planName && (
                <span className="text-xs font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-1">
                  {planName}
                </span>
              )}
              {amount != null && (
                <span className="text-sm font-semibold text-slate-700">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount)}
                  <span className="text-slate-400 font-normal"> / ay</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border border-slate-200 bg-white mb-0">
          <button
            type="button"
            onClick={() => setActiveTab("cancel")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === "cancel"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Aboneliğimi İptal Et
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-3 text-sm font-semibold border-l border-slate-200 transition-colors ${
              activeTab === "card"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Kart Bilgilerimi Güncelle
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border border-t-0 border-slate-200">
          {activeTab === "cancel" ? (
            <CancelFlow token={token} tenantName={tenantName} />
          ) : (
            <CardUpdateFlow token={token} />
          )}
        </div>
      </main>

      <footer className="text-center pb-8 text-xs text-slate-400">
        256-bit SSL şifrelemesi · Verileriniz güvende
      </footer>
    </div>
  );
}

// ─── CANCEL FLOW ──────────────────────────────────────────────────────────────

function CancelFlow({ token, tenantName }: { token: string; tenantName: string }) {
  const [step, setStep] = useState<CancelStep>("survey");
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [result, setResult] = useState<ResultAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stepNum = step === "survey" ? 1 : step === "done" ? 3 : 2;

  async function submitAction(action: ResultAction) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, reason }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "İstek başarısız oldu.");
      }
      setResult(action);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && result) {
    return (
      <div className="p-8 text-center">
        <div
          className={`mx-auto mb-5 w-14 h-14 flex items-center justify-center ${
            result === "cancel" ? "bg-red-100" : "bg-green-100"
          }`}
        >
          <span className={`text-2xl font-bold ${result === "cancel" ? "text-red-600" : "text-green-600"}`}>
            {result === "cancel" ? "✕" : "✓"}
          </span>
        </div>
        {result === "cancel" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aboneliğiniz iptal edildi</h2>
            <p className="text-sm text-slate-500">
              <strong>{tenantName}</strong> aboneliğiniz sonlandırıldı. İstediğiniz zaman tekrar abone olabilirsiniz.
            </p>
          </>
        )}
        {result === "accept_discount" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">İndiriminiz uygulandı</h2>
            <p className="text-sm text-slate-500">
              Sonraki 2 ay boyunca aboneliğiniz <strong>%50 indirimli</strong> devam edecek. Teşekkür ederiz!
            </p>
          </>
        )}
        {result === "accept_pause" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aboneliğiniz donduruldu</h2>
            <p className="text-sm text-slate-500">
              Aboneliğiniz <strong>1 ay</strong> askıya alındı. Hazır olduğunuzda otomatik devam edecek.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0 ${
                n <= stepNum ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div className={`h-0.5 flex-1 ${n < stepNum ? "bg-indigo-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
        <span className="ml-3 text-xs text-slate-500 whitespace-nowrap">
          {step === "survey" ? "Neden iptal ediyorsunuz?" : step === "offer" ? "Özel teklifiniz" : "Onay"}
        </span>
      </div>

      {/* Survey step */}
      {step === "survey" && (
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            İptal nedeninizi seçin
          </h2>
          <div className="space-y-2 mb-6">
            {REASONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setReason(item.id)}
                className={`w-full text-left p-4 border transition-colors ${
                  reason === item.id
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-400 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center shrink-0 ${
                      reason === item.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}
                  >
                    {reason === item.id && <div className="w-1.5 h-1.5 bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!reason}
            onClick={() => {
              if (!reason) return;
              setStep(reason === "too_expensive" || reason === "temporary" ? "offer" : "confirm");
            }}
            className="w-full bg-indigo-600 text-white py-3 text-sm font-bold disabled:opacity-30 hover:bg-indigo-700 transition-colors uppercase tracking-wide"
          >
            Devam Et
          </button>
        </div>
      )}

      {/* Offer — too_expensive */}
      {step === "offer" && reason === "too_expensive" && (
        <div>
          <div className="border-l-4 border-indigo-600 bg-indigo-50 p-5 mb-6">
            <span className="inline-block bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 mb-3 uppercase tracking-widest">
              Size Özel Teklif
            </span>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sonraki 2 ay %50 indirim</h2>
            <p className="text-sm text-slate-600">
              Aboneliğinizi koruyun; ödemeleriniz 2 ay boyunca yarı fiyatına düşsün.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => submitAction("accept_discount")}
            className="w-full bg-indigo-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors uppercase tracking-wide mb-3"
          >
            {loading ? "İşleniyor..." : "Teklifi Kabul Et"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("confirm")}
            className="w-full border border-slate-300 text-slate-600 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Yine de iptal et
          </button>
        </div>
      )}

      {/* Offer — temporary */}
      {step === "offer" && reason === "temporary" && (
        <div>
          <div className="border-l-4 border-indigo-600 bg-indigo-50 p-5 mb-6">
            <span className="inline-block bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 mb-3 uppercase tracking-widest">
              Alternatif Öneri
            </span>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1 ay dondurun (Pause)</h2>
            <p className="text-sm text-slate-600">
              İptal etmek yerine aboneliğinizi 1 ay askıya alın. Hazır olduğunuzda kaldığınız yerden devam edin.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => submitAction("accept_pause")}
            className="w-full bg-indigo-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors uppercase tracking-wide mb-3"
          >
            {loading ? "İşleniyor..." : "Aboneliği Dondur"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("confirm")}
            className="w-full border border-slate-300 text-slate-600 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Yine de iptal et
          </button>
        </div>
      )}

      {/* Confirm */}
      {step === "confirm" && (
        <div>
          <div className="border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-800 font-medium mb-1">Bu işlem geri alınamaz</p>
            <p className="text-sm text-red-700">
              <strong>{tenantName}</strong> aboneliğiniz kalıcı olarak iptal edilecek ve premium özelliklere erişiminiz sona erecek.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => submitAction("cancel")}
            className="w-full bg-red-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-red-700 transition-colors uppercase tracking-wide mb-3"
          >
            {loading ? "İşleniyor..." : "Aboneliğimi Kalıcı Olarak İptal Et"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setStep(reason === "too_expensive" || reason === "temporary" ? "offer" : "survey")
            }
            className="w-full border border-slate-300 text-slate-600 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            ← Geri Dön
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

// ─── CARD UPDATE FLOW ─────────────────────────────────────────────────────────

function CardUpdateFlow({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRedirect() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => null)) as {
        checkoutUrl?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.checkoutUrl) {
        throw new Error(data?.error ?? "Yönlendirme başarısız oldu.");
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-sm font-bold text-slate-900 mb-5 uppercase tracking-wide">
        Kart Bilgilerini Güncelle
      </h2>

      <div className="border border-slate-200 bg-slate-50 p-5 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Güvenli ödeme sayfasına yönlendirileceksiniz</p>
            <p className="text-xs text-slate-500">
              Kart bilgileriniz iyzico'nun PCI DSS sertifikalı güvenli sayfasında işlenir. Bilgileriniz bizim sistemimizde saklanmaz.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-xs text-red-600">{error}</p>}

      <button
        type="button"
        disabled={loading}
        onClick={handleRedirect}
        className="w-full bg-indigo-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors uppercase tracking-wide"
      >
        {loading ? "Yönlendiriliyor..." : "iyzico ile Kartı Güncelle →"}
      </button>

      <p className="mt-4 text-center text-xs text-slate-400">
        256-bit SSL şifrelemesi · iyzico güvencesiyle
      </p>
    </div>
  );
}
