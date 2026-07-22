"use client";

import { useState } from "react";
import type { SubscriptionStatus } from "@prisma/client";

type Tab = "cancel" | "card";
type CancelReason = "too_expensive" | "technical" | "temporary" | "alternative" | "billing_date";
type CancelStep = "survey" | "offer" | "confirm" | "done";
type ResultAction = "accept_discount" | "accept_pause" | "accept_downgrade" | "cancel";

export type OfferConfig  = { type: "DISCOUNT" | "PAUSE" | "DOWNGRADE"; value: number };
export type OfferMap     = Partial<Record<string, OfferConfig>>;
export type SurveyConfig = { label: string; description: string };
export type SurveyMap    = Partial<Record<string, SurveyConfig>>;
export type BrandingConfig = { brandColor?: string; logoUrl?: string; portalTitle?: string };
export type Testimonial    = { id: string; customerName: string; role?: string; quote: string };

const DEFAULT_REASONS: { id: CancelReason; label: string; desc: string }[] = [
  { id: "too_expensive", label: "Cok pahali",                               desc: "Fiyatlandirma butcemi asiyor" },
  { id: "technical",     label: "Teknik sorunlar yasiyorum",                desc: "Urun bekledigim gibi calismıyor" },
  { id: "temporary",     label: "Gecici olarak ihtiyacim yok",              desc: "Su an kullanmiyorum ama geri donebilirim" },
  { id: "alternative",   label: "Baska bir alternatif buldum",              desc: "Farklı bir cozume geciyorum" },
  { id: "billing_date",  label: "Odeme tarihi maas gunume uymuyor",         desc: "Para geldiginde odeyebilirim ama su an tam zamani degil" },
];

interface Props {
  token: string;
  tenantName: string;
  subscriptionStatus: SubscriptionStatus;
  planName?: string;
  amount?: number;
  currency?: string;
  pauseUntil?: string;
  offerMap: OfferMap;
  surveyMap: SurveyMap;
  branding: BrandingConfig;
  testimonials: Testimonial[];
  autoOffer?: "discount" | "pause";
  embed?: boolean;
}

function notify(type: "SUBKORU_CLOSE" | "SUBKORU_SAVED" | "SUBKORU_CANCELLED") {
  if (typeof window !== "undefined") {
    window.parent.postMessage({ type }, "*");
  }
}

export default function PortalClient({
  token, tenantName, subscriptionStatus,
  planName, amount, currency = "TRY",
  pauseUntil, offerMap, surveyMap, branding, testimonials, autoOffer,
  embed = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(
    autoOffer ? "cancel" : subscriptionStatus === "PAST_DUE" ? "card" : "cancel"
  );
  const accent = branding.brandColor ?? "#4f46e5";

  const pauseRemainingDays = pauseUntil
    ? Math.max(0, Math.ceil((new Date(pauseUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  if (subscriptionStatus === "PAUSED") {
    return (
      <PausedView
        token={token} tenantName={tenantName} accent={accent}
        branding={branding} remainingDays={pauseRemainingDays}
        pauseUntil={pauseUntil} embed={embed}
        onClose={() => notify("SUBKORU_CLOSE")}
        onSaved={() => notify("SUBKORU_SAVED")}
      />
    );
  }

  if (subscriptionStatus === "CANCELLED") {
    return (
      <CancelledView
        token={token} tenantName={tenantName} accent={accent} branding={branding}
        embed={embed}
        onClose={() => notify("SUBKORU_CLOSE")}
        onSaved={() => notify("SUBKORU_SAVED")}
      />
    );
  }

  const pageWrap = embed
    ? "h-full flex flex-col bg-slate-50 overflow-auto"
    : "min-h-screen bg-slate-50";

  return (
    <div className={pageWrap}>
      <PortalHeader
        branding={branding} tenantName={tenantName} accent={accent}
        embed={embed} onClose={() => notify("SUBKORU_CLOSE")}
      />

      <main className="mx-auto max-w-xl w-full px-4 py-8 flex-1">
        {subscriptionStatus === "PAST_DUE" && (
          <div className="mb-6 border-l-4 border-red-500 bg-red-50 px-4 py-3 flex items-start gap-3">
            <span className="text-red-600 font-bold mt-0.5 shrink-0">!</span>
            <div>
              <p className="text-sm font-bold text-red-800">Odemeniz basarisiz oldu</p>
              <p className="text-xs text-red-700 mt-0.5">Aboneliginizin devam edebilmesi icin kart bilgilerinizi guncellemeniz gerekiyor.</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>Abonelik Yonetimi</p>
          <h1 className="text-2xl font-bold text-slate-900">{tenantName}</h1>
          <p className="mt-1 text-sm text-slate-500">Aboneliginizi yonetmek icin asagidaki seceneklerden birini kullanin.</p>
          {(planName || amount) && (
            <div className="mt-4 flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
              {planName && (
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1" style={{ backgroundColor: `${accent}18`, color: accent }}>
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
          {(["cancel", "card"] as Tab[]).map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`flex-1 min-w-0 px-2 py-3 text-sm font-semibold text-center transition-colors ${i > 0 ? "border-l border-slate-200" : ""}`}
              style={activeTab === t ? { backgroundColor: accent, color: "#fff" } : { color: "#475569" }}
            >
              {t === "cancel" ? "Aboneligi Iptal Et" : "Kart Bilgilerimi Guncelle"}
            </button>
          ))}
        </div>

        <div className="bg-white border border-t-0 border-slate-200">
          {activeTab === "cancel" ? (
            <CancelFlow
              token={token} tenantName={tenantName} offerMap={offerMap}
              surveyMap={surveyMap} accent={accent} testimonials={testimonials}
              autoOffer={autoOffer} embed={embed}
              onSaved={() => notify("SUBKORU_SAVED")}
              onCancelled={() => notify("SUBKORU_CANCELLED")}
            />
          ) : (
            <CardUpdateFlow token={token} accent={accent} />
          )}
        </div>
      </main>

      {!embed && <PortalFooter />}
    </div>
  );
}

// ─── PAUSED VIEW ──────────────────────────────────────────────────────────────

function PausedView({ token, tenantName, accent, branding, remainingDays, pauseUntil, embed, onClose, onSaved }: {
  token: string; tenantName: string; accent: string;
  branding: BrandingConfig; remainingDays: number; pauseUntil?: string;
  embed: boolean; onClose(): void; onSaved(): void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleResume() {
    setLoading(true);
    const res = await fetch("/api/reactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (res.ok) { setDone(true); if (embed) setTimeout(onSaved, 1500); }
    else {
      const d = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(d?.error ?? "Bir hata olustu.");
    }
  }

  const pageWrap = embed ? "h-full flex flex-col bg-slate-50 overflow-auto" : "min-h-screen bg-slate-50";

  return (
    <div className={pageWrap}>
      <PortalHeader branding={branding} tenantName={tenantName} accent={accent} embed={embed} onClose={onClose} />
      <main className="mx-auto max-w-xl px-4 py-16 text-center flex-1">
        <div className="bg-white border border-slate-200 p-10">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: `${accent}12`, color: accent }}>
            II
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Aboneliginiz Donduruldu</h1>
          {done ? (
            <p className="text-sm text-green-700 font-medium mt-4">Aboneliginiz yeniden aktif edildi.</p>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {remainingDays > 0
                  ? <><strong>{remainingDays} gun</strong> sonra otomatik olarak devam edecek.</>
                  : pauseUntil
                    ? <>{new Date(pauseUntil).toLocaleDateString("tr-TR")} tarihinde yeniden aktif olacak.</>
                    : "Aboneliginiz askiya alinmistir."}
              </p>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={handleResume}
                className="w-full py-3 text-sm font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: accent }}
              >
                {loading ? "Isleniyor..." : "Aboneligi Hemen Devam Ettir"}
              </button>
              <p className="mt-4 text-xs text-slate-400">Beklemek isterseniz hicbir sey yapmaniza gerek yok.</p>
            </>
          )}
        </div>
      </main>
      {!embed && <PortalFooter />}
    </div>
  );
}

// ─── CANCELLED VIEW ───────────────────────────────────────────────────────────

function CancelledView({ token, tenantName, accent, branding, embed, onClose, onSaved }: {
  token: string; tenantName: string; accent: string; branding: BrandingConfig;
  embed: boolean; onClose(): void; onSaved(): void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleReactivate() {
    setLoading(true);
    const res = await fetch("/api/reactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (res.ok) { setDone(true); if (embed) setTimeout(onSaved, 1500); }
    else {
      const d = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(d?.error ?? "Bir hata olustu.");
    }
  }

  const pageWrap = embed ? "h-full flex flex-col bg-slate-50 overflow-auto" : "min-h-screen bg-slate-50";

  return (
    <div className={pageWrap}>
      <PortalHeader branding={branding} tenantName={tenantName} accent={accent} embed={embed} onClose={onClose} />
      <main className="mx-auto max-w-xl px-4 py-16 text-center flex-1">
        <div className="bg-white border border-slate-200 p-10">
          {done ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 flex items-center justify-center text-xl font-bold text-green-600">ok</div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Talebiniz Alindi</h1>
              <p className="text-sm text-slate-500">Ekibimiz en kisa surede sizinle iletisime gececek.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">X</div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Aboneliginiz Iptal Edildi</h1>
              <p className="text-sm text-slate-500 mb-8">
                <strong>{tenantName}</strong> aboneliginiz daha once iptal edilmistir. Geri donmek ister misiniz?
              </p>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={handleReactivate}
                className="w-full py-3 text-sm font-bold text-white disabled:opacity-40 mb-3"
                style={{ backgroundColor: accent }}
              >
                {loading ? "Isleniyor..." : "Yeniden Abone Olmak Istiyorum"}
              </button>
              <p className="text-xs text-slate-400">Ekibimiz sizinle iletisime gececek.</p>
            </>
          )}
        </div>
      </main>
      {!embed && <PortalFooter />}
    </div>
  );
}

// ─── CANCEL FLOW ─────────────────────────────────────────────────────────────

function CancelFlow({
  token, tenantName, offerMap, surveyMap, accent, testimonials, autoOffer,
  embed, onSaved, onCancelled,
}: {
  token: string; tenantName: string; offerMap: OfferMap;
  surveyMap: SurveyMap; accent: string; testimonials: Testimonial[];
  autoOffer?: "discount" | "pause";
  embed: boolean; onSaved(): void; onCancelled(): void;
}) {
  const initialReason: CancelReason | null =
    autoOffer === "discount" ? "too_expensive" :
    autoOffer === "pause"    ? "temporary"     : null;
  const initialStep: CancelStep = autoOffer ? "offer" : "survey";

  const [step, setStep] = useState<CancelStep>(initialStep);
  const [reason, setReason] = useState<CancelReason | null>(initialReason);
  const [result, setResult] = useState<ResultAction | null>(null);
  const [acceptedOffer, setAcceptedOffer] = useState<OfferConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stepNum = step === "survey" ? 1 : step === "done" ? 3 : 2;
  const currentOffer: OfferConfig | null = reason
    ? (offerMap[reason.toUpperCase()]
        ?? (reason === "billing_date"  ? (offerMap["TEMPORARY"] ?? { type: "PAUSE",    value: 30 }) : null)
        ?? (reason === "too_expensive" ?                          { type: "DISCOUNT",  value: 30 }  : null)
        ?? (reason === "temporary"     ?                          { type: "PAUSE",     value: 30 }  : null))
    : null;
  const featuredTestimonial = testimonials[0] ?? null;

  const reasons = DEFAULT_REASONS.map((r) => {
    const custom = surveyMap[r.id.toUpperCase()];
    return { ...r, label: custom?.label ?? r.label, desc: custom?.description ?? r.desc };
  });

  async function submitAction(action: ResultAction, offer?: OfferConfig) {
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
        throw new Error(data?.error ?? "Istek basarisiz oldu.");
      }
      if (offer) setAcceptedOffer(offer);
      setResult(action);
      setStep("done");
      if (embed) {
        if (action === "cancel") setTimeout(onCancelled, 1800);
        else                     setTimeout(onSaved,     1800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && result) {
    const isSuccess = result !== "cancel";
    return (
      <div className="p-8 text-center">
        <div className={`mx-auto mb-5 w-14 h-14 flex items-center justify-center ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
          <span className={`text-xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {isSuccess ? "ok" : "X"}
          </span>
        </div>
        {result === "cancel" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aboneliginiz iptal edildi</h2>
            <p className="text-sm text-slate-500"><strong>{tenantName}</strong> aboneliginiz sonlandirildi.</p>
          </>
        )}
        {result === "accept_discount" && acceptedOffer && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Indiriminiz uygulandi</h2>
            <p className="text-sm text-slate-500">Aboneliginiz <strong>%{acceptedOffer.value} indirimli</strong> devam edecek.</p>
          </>
        )}
        {result === "accept_pause" && acceptedOffer && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aboneliginiz donduruldu</h2>
            <p className="text-sm text-slate-500">Aboneliginiz <strong>{acceptedOffer.value} gun</strong> askiya alindi.</p>
          </>
        )}
        {result === "accept_downgrade" && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Plan degisikliginiz iletildi</h2>
            <p className="text-sm text-slate-500">Ekibimiz en kisa surede daha uygun plan seceneginizi isleme koyacak.</p>
          </>
        )}
        {embed && (
          <button
            type="button"
            onClick={result === "cancel" ? onCancelled : onSaved}
            className="mt-6 px-6 py-2.5 text-sm font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Kapat
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Progress */}
      <div className="flex items-center gap-0 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div
              className="w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0"
              style={n <= stepNum ? { backgroundColor: accent, color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
            >
              {n}
            </div>
            {n < 3 && <div className="h-0.5 flex-1" style={{ backgroundColor: n < stepNum ? accent : "#e2e8f0" }} />}
          </div>
        ))}
        <span className="ml-3 text-xs text-slate-500 whitespace-nowrap">
          {step === "survey" ? "Neden iptal ediyorsunuz?" : step === "offer" ? "Ozel teklifiniz" : "Onay"}
        </span>
      </div>

      {/* Survey */}
      {step === "survey" && (
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Iptal nedeninizi secin</h2>
          <div className="space-y-2 mb-5">
            {reasons.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setReason(item.id)}
                className="w-full text-left p-4 border transition-colors"
                style={reason === item.id
                  ? { borderColor: accent, backgroundColor: `${accent}08` }
                  : { borderColor: "#e2e8f0", backgroundColor: "#fff" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-4 h-4 border-2 flex items-center justify-center shrink-0"
                    style={reason === item.id
                      ? { borderColor: accent, backgroundColor: accent }
                      : { borderColor: "#d1d5db" }}
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

          {featuredTestimonial && (
            <div className="mb-5 p-4 border border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600 italic mb-3">&ldquo;{featuredTestimonial.quote}&rdquo;</p>
              <p className="text-xs font-semibold text-slate-700">
                — {featuredTestimonial.customerName}
                {featuredTestimonial.role && <span className="font-normal text-slate-500">, {featuredTestimonial.role}</span>}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!reason}
            onClick={() => {
              if (!reason) return;
              const offer = offerMap[reason.toUpperCase()]
                ?? (reason === "billing_date"  ? (offerMap["TEMPORARY"] ?? { type: "PAUSE",   value: 30 }) : null)
                ?? (reason === "too_expensive" ?                           { type: "DISCOUNT", value: 30 }  : null)
                ?? (reason === "temporary"     ?                           { type: "PAUSE",    value: 30 }  : null);
              setStep(offer ? "offer" : "confirm");
            }}
            className="w-full text-white py-3 text-sm font-bold disabled:opacity-30 uppercase tracking-wide"
            style={{ backgroundColor: accent }}
          >
            Devam Et
          </button>
        </div>
      )}

      {/* Offer */}
      {step === "offer" && currentOffer && (
        <div>
          <div className="p-5 mb-6" style={{ borderLeft: `4px solid ${accent}`, backgroundColor: `${accent}08` }}>
            <span className="inline-block text-white text-[10px] font-bold px-2 py-0.5 mb-3 uppercase tracking-widest" style={{ backgroundColor: accent }}>
              Size Ozel Teklif
            </span>
            {currentOffer.type === "DISCOUNT" && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">%{currentOffer.value} Indirim</h2>
                <p className="text-sm text-slate-600">Bir sonraki donemde %{currentOffer.value} indirimli devam edin.</p>
              </>
            )}
            {currentOffer.type === "PAUSE" && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{currentOffer.value} Gun Dondurma</h2>
                <p className="text-sm text-slate-600">{currentOffer.value} gun askiya alin, hazir olunca devam edin.</p>
              </>
            )}
            {currentOffer.type === "DOWNGRADE" && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Daha Uygun Plana Gec</h2>
                <p className="text-sm text-slate-600">Aboneliginizi iptal etmek yerine daha uygun fiyatli bir plana gecin. Ekibimiz size en kisa surede ulasacak.</p>
              </>
            )}
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => submitAction(
              currentOffer.type === "DISCOUNT" ? "accept_discount"
                : currentOffer.type === "PAUSE" ? "accept_pause"
                : "accept_downgrade",
              currentOffer
            )}
            className="w-full text-white py-3 text-sm font-bold disabled:opacity-40 uppercase tracking-wide mb-3"
            style={{ backgroundColor: accent }}
          >
            {loading ? "Isleniyor..." : currentOffer.type === "DISCOUNT" ? "Indirimi Kabul Et" : currentOffer.type === "PAUSE" ? "Aboneligi Dondur" : "Plan Dusurme Talebi Gonder"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("confirm")}
            className="w-full border border-slate-300 text-slate-600 py-3 text-sm font-medium hover:bg-slate-50"
          >
            Yine de iptal et
          </button>
        </div>
      )}

      {/* Confirm */}
      {step === "confirm" && (
        <div>
          <div className="border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-800 font-medium mb-1">Bu islem geri alinamaz</p>
            <p className="text-sm text-red-700"><strong>{tenantName}</strong> aboneliginiz kalici olarak iptal edilecek.</p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => submitAction("cancel")}
            className="w-full bg-red-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-red-700 uppercase tracking-wide mb-3"
          >
            {loading ? "Isleniyor..." : "Aboneligi Kalici Olarak Iptal Et"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep(currentOffer ? "offer" : "survey")}
            className="w-full border border-slate-300 text-slate-600 py-3 text-sm font-medium hover:bg-slate-50"
          >
            Geri Don
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}

// ─── CARD UPDATE FLOW ─────────────────────────────────────────────────────────

function CardUpdateFlow({ token, accent }: { token: string; accent: string }) {
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
      const data = (await res.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;
      if (!res.ok || !data?.checkoutUrl) throw new Error(data?.error ?? "Yonlendirme basarisiz oldu.");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-sm font-bold text-slate-900 mb-5 uppercase tracking-wide">Kart Bilgilerini Guncelle</h2>
      <div className="border border-slate-200 bg-slate-50 p-5 mb-6">
        <p className="text-sm font-semibold text-slate-900 mb-1">Guvenli odeme sayfasina yonlendirileceksiniz</p>
        <p className="text-xs text-slate-500">Kart bilgileriniz iyzico&apos;nun PCI DSS sertifikali guvenli sayfasinda islenir.</p>
      </div>
      {error && <p className="mb-4 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={handleRedirect}
        className="w-full text-white py-3 text-sm font-bold disabled:opacity-40 uppercase tracking-wide"
        style={{ backgroundColor: accent }}
      >
        {loading ? "Yonlendiriliyor..." : "iyzico ile Karti Guncelle"}
      </button>
      <p className="mt-4 text-center text-xs text-slate-400">256-bit SSL sifrelemesi</p>
    </div>
  );
}

// ─── SHARED ───────────────────────────────────────────────────────────────────

function PortalHeader({ branding, tenantName, accent, embed, onClose }: {
  branding: BrandingConfig; tenantName: string; accent: string;
  embed: boolean; onClose(): void;
}) {
  return (
    <header className="border-b border-slate-200 bg-white shrink-0">
      <div className="mx-auto max-w-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt={tenantName} className="h-7 w-auto object-contain" />
          ) : (
            <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: accent }}>
              <span className="text-white text-xs font-bold">{(branding.portalTitle ?? tenantName).slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <span className="font-semibold text-slate-900 text-sm">{branding.portalTitle ?? "Subkoru"}</span>
        </div>
        {embed ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        ) : (
          <span className="text-xs text-slate-500">Guvenli baglanti</span>
        )}
      </div>
    </header>
  );
}

function PortalFooter() {
  return <footer className="text-center pb-8 text-xs text-slate-400">256-bit SSL sifrelemesi</footer>;
}
