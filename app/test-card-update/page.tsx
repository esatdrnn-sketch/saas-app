"use client";

import { useState, useEffect } from "react";

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

export default function TestCardUpdatePage() {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnToken, setReturnToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnToken(params.get("token"));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const dest = returnToken
        ? `/card-updated?token=${encodeURIComponent(returnToken)}`
        : "/card-updated";
      window.location.href = dest;
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RP</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">RecoverPanel</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            TEST MODU
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
            Ödeme Bilgileri
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Kart Bilgilerini Güncelle</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bu sayfa geliştirme ortamında kart güncelleme akışını simüle eder.
          </p>
        </div>

        {!done && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200">
            {/* iyzico benzeri banner */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs text-slate-500">Güvenli ödeme simülasyonu · iyzico test ortamı</span>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kart Sahibi
                </label>
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Son Kullanma
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="AA/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    CVC
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors uppercase tracking-wide"
              >
                {loading ? "İşleniyor..." : "Kartı Güncelle"}
              </button>

              <p className="text-center text-xs text-slate-400">
                256-bit SSL · iyzico test ortamı — gerçek ödeme alınmaz
              </p>
            </div>
          </form>
        )}
      </main>


      <footer className="pb-6 text-center text-xs text-slate-400">
        RecoverPanel · Geliştirme / Test Ortamı
      </footer>
    </div>
  );
}
