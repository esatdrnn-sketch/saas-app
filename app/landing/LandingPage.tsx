"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo, LogoIcon } from "@/components/logo";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const vp = { once: true, margin: "-80px" } as const;

const WA_URL = "https://wa.me/905374237085?text=Merhaba%2C%20Subkoru%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#0f172a", background: "#fff" }}>
      <style>{`
        .lp-section   { padding: 96px 24px; }
        .lp-2col      { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-how-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .lp-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .lp-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e2e8f0; }
        .lp-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .lp-phone-col { display: flex; justify-content: center; }

        @media (max-width: 900px) {
          .lp-feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-2col      { gap: 48px !important; }
        }

        @media (max-width: 768px) {
          .lp-section   { padding: 64px 20px !important; }
          .lp-2col      { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-how-grid  { grid-template-columns: 1fr !important; }
          .lp-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-calc-grid { grid-template-columns: 1fr !important; }
          .lp-hero-mockup { display: none !important; }
        }

        @media (max-width: 480px) {
          .lp-section    { padding: 48px 16px !important; }
          .lp-feat-grid  { grid-template-columns: 1fr !important; }
          .lp-stat-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-nav-login  { display: none !important; }
          .lp-how-step   { padding: 28px 24px !important; }
          .lp-phone-wrap { max-width: 100% !important; width: min(290px, calc(100vw - 32px)) !important; }
        }
      `}</style>
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <WhatsAppSection />
      <BrandingSection />
      <EmailSection />
      <Features />
      <Calculator />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header style={{ borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={32} />
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/tenant/login" className="lp-nav-login" style={{ fontSize: 14, color: "#64748b", textDecoration: "none", padding: "8px 16px", fontWeight: 500 }}>
            Giriş Yap
          </Link>
          <a
            href={WA_URL}
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#4f46e5", padding: "9px 20px", textDecoration: "none", letterSpacing: "0.01em" }}
          >
            Demo İste
          </a>
        </nav>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="lp-section" style={{ background: "linear-gradient(180deg, #fafafa 0%, #fff 100%)", padding: "96px 24px 80px", textAlign: "center" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 14px", marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em" }}>iyzico entegrasyonlu</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 24px", color: "#0f172a" }}>
          Kaybettiğiniz abonelikleri<br />
          <span style={{ color: "#4f46e5" }}>otomatik geri kazanın</span>
        </h1>

        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.7, margin: "0 0 48px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          Ödeme başarısızlıklarını, iptal taleplerini ve churn&apos;u azaltın. Müşterilerinize özel portal, akıllı teklifler ve dunning e-postası — hepsi entegre.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={WA_URL}
            style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#4f46e5", padding: "14px 32px", textDecoration: "none", letterSpacing: "0.01em" }}
          >
            Ücretsiz Demo Al
          </a>
          <a
            href="#nasil-calisir"
            style={{ fontSize: 15, fontWeight: 600, color: "#475569", background: "#fff", border: "1.5px solid #e2e8f0", padding: "14px 32px", textDecoration: "none" }}
          >
            Nasıl Çalışır?
          </a>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
          Kurulum ücreti yok — sadece kurtarılan ödemelerden pay alınır
        </p>
      </div>

      {/* Mockup */}
      <div className="lp-hero-mockup" style={{ maxWidth: 860, margin: "64px auto 0", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 24px 60px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* Tarayıcı çubuğu */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#f87171", "#fbbf24", "#34d399"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 12px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            app.subkoru.com/admin
          </div>
        </div>

        {/* Dashboard içeriği */}
        <div style={{ padding: "20px 24px", background: "#f8fafc" }}>

          {/* Üst başlık */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Metrix · Abonelik Paneli</p>
              <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Genel Bakış</p>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "3px 10px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d" }}>● Canlı</span>
            </div>
          </div>

          {/* 6 stat kartı */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Toplam",            value: "47",   color: "#0f172a", bg: "#fff",    border: "#e2e8f0" },
              { label: "Aktif",             value: "38",   color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Ödeme Başarısız",   value: "4",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
              { label: "Kurtarıldı",        value: "8",    color: "#059669", bg: "#ecfdf5", border: "#86efac" },
              { label: "İptal",             value: "3",    color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
              { label: "Kurtarma Oranı",    value: "%67",  color: "#4f46e5", bg: "#f5f3ff", border: "#c4b5fd" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ margin: "0 0 3px", fontSize: 9, color: "#64748b", fontWeight: 600, lineHeight: 1.2 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Abonelik tablosu */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
              {["Müşteri", "Plan", "Tutar", "Durum"].map((h) => (
                <span key={h} style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {[
              { musteri: "Zeynep K.", plan: "Pro",      tutar: "₺499/ay", durum: "Kurtarıldı",       dk: "#059669", db: "#ecfdf5" },
              { musteri: "Murat D.",  plan: "Starter",  tutar: "₺199/ay", durum: "Aktif",            dk: "#2563eb", db: "#eff6ff" },
              { musteri: "Selin A.",  plan: "Business", tutar: "₺999/ay", durum: "Ödeme Başarısız",  dk: "#dc2626", db: "#fef2f2" },
              { musteri: "Emre T.",   plan: "Pro",      tutar: "₺499/ay", durum: "Kurtarıldı",       dk: "#059669", db: "#ecfdf5" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 12px", borderBottom: i < 3 ? "1px solid #f8fafc" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{row.musteri}</span>
                <span style={{ fontSize: 10, color: "#64748b" }}>{row.plan}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{row.tutar}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: row.dk, background: row.db, padding: "2px 6px", display: "inline-block" }}>{row.durum}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: "%30+", label: "Ortalama kurtarma oranı" },
    { value: "3 dk", label: "Kurulum süresi" },
    { value: "%0",   label: "Upfront maliyet" },
    { value: "7/24", label: "Otomatik çalışma" },
  ];

  return (
    <section style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={vp}
        className="lp-stat-grid"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeUp} style={{ padding: "40px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#4f46e5", letterSpacing: "-0.02em", marginBottom: 6 }}>{item.value}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{item.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Aboneliklerinizi ekleyin",
      desc: "iyzico abonelik referans kodunuzu sisteme girin. Kurulum 3 dakika sürer, entegrasyon gerektirmez.",
    },
    {
      num: "02",
      title: "Müşteri portali devreye girer",
      desc: "Ödeme başarısız olan veya iptal talebinde bulunan müşteri otomatik olarak kişisel portala yönlendirilir.",
    },
    {
      num: "03",
      title: "Akıllı teklifler churn'u önler",
      desc: "İptal nedenine göre indirim, dondurma veya plan değişikliği teklifi sunulur. Müşteri kabul ederse abonelik kurtarılır.",
    },
    {
      num: "04",
      title: "Siz sadece sonucu görürsünüz",
      desc: "Slack bildirimleri, e-posta raporları ve analitik pano ile tüm süreci takip edin. Hiçbir manuel müdahale gerekmez.",
    },
  ];

  return (
    <section id="nasil-calisir" className="lp-section" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Nasıl Çalışır</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>4 adımda churn kurtarma</h2>
          <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>Kurulumdan ilk kurtarmaya kadar her şey otomatik çalışır.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="lp-how-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="lp-how-step" style={{ padding: "40px 44px", border: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.04em", marginBottom: 20, lineHeight: 1 }}>{step.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", color: "#0f172a" }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── WHATSAPP SECTION ─────────────────────────────────────────────────────────

function WhatsAppSection() {
  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
      <div className="lp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

        {/* Sol: Metin */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #86efac", padding: "6px 14px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp + E-posta</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.2 }}>
            Müşteri WhatsApp&apos;ta<br />
            <span style={{ color: "#22c55e" }}>cevap veriyor, siz kazanıyorsunuz</span>
          </h2>
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, margin: "0 0 32px" }}>
            Ödemesi başarısız olan müşteri WhatsApp&apos;ta neden olduğunu seçiyor. Seçime göre kişisel teklif sunuluyor — indirim, dondurma veya kart güncelleme linki. Müşteri bir tuşa basıyor, abonelik kurtarılıyor.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { kanal: "WhatsApp", aciklama: "Ödeme başarısız olunca anında mesaj, neden seçimi, kişisel teklif" },
              { kanal: "E-posta",  aciklama: "3 aşamalı dunning serisi — 0, 3 ve 7. günlerde otomatik" },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 36, height: 36, background: i === 0 ? "#dcfce7" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? "#15803d" : "#6d28d9" }}>
                    {i === 0 ? "WA" : "@"}
                  </span>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.kanal}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{item.aciklama}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Sağ: WhatsApp konuşma akışı mockup */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="lp-phone-wrap" style={{ width: 290, background: "#111827", borderRadius: 40, padding: "12px 10px", boxShadow: "0 32px 64px rgba(0,0,0,0.2)" }}>

            {/* Telefon üst çubuğu */}
            <div style={{ background: "#1f2937", borderRadius: "30px 30px 0 0", padding: "14px 16px 12px" }}>
              <div style={{ width: 60, height: 4, background: "#374151", borderRadius: 2, margin: "0 auto 12px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>A</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#fff" }}>Metrix</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>Çevrimiçi</p>
                </div>
              </div>
            </div>

            {/* Sohbet */}
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.55, delayChildren: 0.4 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              style={{ background: "#0b1120", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Bot: ilk mesaj */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } }}
                style={{ alignSelf: "flex-start", maxWidth: "90%" }}
              >
                <div style={{ background: "#1f2937", borderRadius: "4px 14px 14px 14px", padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#e5e7eb", lineHeight: 1.5 }}>
                    Merhaba! <strong style={{ color: "#fff" }}>Metrix</strong> ödeme destek ekibinden yazıyoruz.<br />Abonelik ödemeniz alınamadı — endişelenmeyin, birlikte çözelim.
                  </p>
                  {["1️⃣ Kartımı güncelleyeyim", "2️⃣ Çok pahalıya geliyor", "3️⃣ Şimdilik ihtiyacım yok", "4️⃣ Teknik sorun var", "5️⃣ Ödeme tarihi maaş günüme uymuyor"].map((opt, i) => (
                    <p key={i} style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{opt}</p>
                  ))}
                </div>
                <p style={{ margin: "3px 0 0 4px", fontSize: 9, color: "#4b5563" }}>09:14</p>
              </motion.div>

              {/* Kullanıcı: seçim */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } } }}
                style={{ alignSelf: "flex-end", maxWidth: "65%" }}
              >
                <div style={{ background: "#166534", borderRadius: "14px 4px 14px 14px", padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#dcfce7" }}>2</p>
                </div>
                <p style={{ margin: "3px 4px 0 0", fontSize: 9, color: "#4b5563", textAlign: "right" }}>09:15 ✓✓</p>
              </motion.div>

              {/* Bot: indirim teklifi */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } }}
                style={{ alignSelf: "flex-start", maxWidth: "90%" }}
              >
                <div style={{ background: "#1f2937", borderRadius: "4px 14px 14px 14px", padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#e5e7eb", lineHeight: 1.5 }}>
                    Anlıyoruz. Size özel <strong style={{ color: "#22c55e" }}>%30 indirim</strong> sunmak istiyoruz — 3 ay geçerli.
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>1️⃣ Evet, indirimi kabul ediyorum</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>2️⃣ Hayır, iptal etmek istiyorum</p>
                </div>
                <p style={{ margin: "3px 0 0 4px", fontSize: 9, color: "#4b5563" }}>09:15</p>
              </motion.div>

              {/* Kullanıcı: kabul */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } } }}
                style={{ alignSelf: "flex-end", maxWidth: "65%" }}
              >
                <div style={{ background: "#166534", borderRadius: "14px 4px 14px 14px", padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#dcfce7" }}>1</p>
                </div>
                <p style={{ margin: "3px 4px 0 0", fontSize: 9, color: "#4b5563", textAlign: "right" }}>09:16 ✓✓</p>
              </motion.div>

              {/* Bot: link */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } }}
                style={{ alignSelf: "flex-start", maxWidth: "90%" }}
              >
                <div style={{ background: "#1f2937", borderRadius: "4px 14px 14px 14px", padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#e5e7eb", lineHeight: 1.5 }}>
                    Harika! İndiriminizi aktif etmek için:
                  </p>
                  <div style={{ background: "#14532d", border: "1px solid #22c55e", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#86efac" }}>✓ İndirimi Aktif Et →</span>
                  </div>
                </div>
                <p style={{ margin: "3px 0 0 4px", fontSize: 9, color: "#4b5563" }}>09:16</p>
              </motion.div>

              {/* Sistem notu */}
              <motion.div
                variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35 } } }}
                style={{ alignSelf: "center", background: "#1f2937", borderRadius: 6, padding: "3px 10px" }}
              >
                <p style={{ margin: 0, fontSize: 9, color: "#6b7280" }}>Abonelik kurtarıldı ✓</p>
              </motion.div>
            </motion.div>

            {/* Mesaj yazma alanı */}
            <div style={{ background: "#1f2937", borderRadius: "0 0 30px 30px", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, background: "#374151", borderRadius: 20, padding: "7px 12px" }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>Mesaj yaz...</span>
              </div>
              <div style={{ width: 30, height: 30, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 13 }}>→</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ─── BRANDING SECTION ─────────────────────────────────────────────────────────

function BrandingSection() {
  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
      <div className="lp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

        {/* Sol: WhatsApp profil mockup */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="lp-phone-wrap" style={{ width: 290, background: "#111827", borderRadius: 40, padding: "12px 10px", boxShadow: "0 32px 64px rgba(0,0,0,0.2)" }}>

            {/* Status bar */}
            <div style={{ padding: "8px 18px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>09:41</span>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                {[3, 4, 5].map((h) => <div key={h} style={{ width: 3, height: h, background: "#6b7280", borderRadius: 1 }} />)}
                <div style={{ width: 14, height: 8, border: "1.5px solid #6b7280", borderRadius: 2, marginLeft: 3, position: "relative" }}>
                  <div style={{ position: "absolute", top: 1, left: 1, width: "80%", height: "calc(100% - 2px)", background: "#22c55e", borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* WhatsApp profil başlığı (yeşil bar) */}
            <div style={{ background: "#075e54", padding: "10px 14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#fff", fontSize: 18 }}>←</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>M</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Metrix</p>
                <p style={{ margin: 0, fontSize: 10, color: "#a7f3d0" }}>İşletme Hesabı</p>
              </div>
            </div>

            {/* Profil içeriği */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              style={{ background: "#0b1120" }}
            >
              {/* Büyük avatar alanı */}
              <div style={{ background: "#075e54", padding: "24px 0 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                  <span style={{ color: "#fff", fontWeight: 900, fontSize: 34 }}>M</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#fff" }}>Metrix</p>
                  {/* İşletme Hesabı rozeti */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 12px" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#a7f3d0", fontWeight: 700 }}>İşletme Hesabı</span>
                  </div>
                </div>
              </div>

              {/* Bilgi kartları */}
              <div style={{ background: "#1f2937", margin: "8px 10px", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "11px 14px", borderBottom: "1px solid #374151" }}>
                  <p style={{ margin: "0 0 1px", fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Telefon</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#e5e7eb" }}>+90 532 XXX XX XX</p>
                </div>
                <div style={{ padding: "11px 14px" }}>
                  <p style={{ margin: "0 0 1px", fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Açıklama</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#e5e7eb" }}>Metrix ödeme destek hattı</p>
                </div>
              </div>

              {/* Doğrulama notu */}
              <div style={{ margin: "0 10px 12px", background: "#064e3b", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, background: "#25d366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 900 }}>✓</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "#86efac", fontWeight: 700 }}>Resmi İşletme Hesabı</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#6b7280" }}>WhatsApp tarafından doğrulandı</p>
                </div>
              </div>
            </motion.div>

            {/* Alt çubuk */}
            <div style={{ background: "#1f2937", borderRadius: "0 0 30px 30px", padding: "12px 14px" }}>
              <div style={{ height: 4, background: "#374151", borderRadius: 2, width: 40, margin: "0 auto" }} />
            </div>
          </div>
        </motion.div>

        {/* Sağ: Metin */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #86efac", padding: "6px 14px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em" }}>Marka Kimliği Dahil</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.2 }}>
            Müşteriniz sizi tanır —<br />
            <span style={{ color: "#4f46e5" }}>bizi değil</span>
          </h2>
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, margin: "0 0 36px" }}>
            WhatsApp&apos;ta mesaj alan müşteriniz profili açtığında <strong>kendi abone olduğu markayı</strong> ve &quot;İşletme Hesabı&quot; rozetini görür. Subkoru arka planda çalışır, sahne tamamen size aittir.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { title: "Profilde markanızın adı görünür", desc: "Müşteri \"bu kim?\" diye sormaz — kendi abone olduğu şirketi görür." },
              { title: "İşletme Hesabı rozeti güven verir", desc: "WhatsApp, hesabın doğrulanmış bir işletmeye ait olduğunu onaylar." },
              { title: "Kurulum ve yönetim bizden, ücretsiz", desc: "WhatsApp Business hesabı dahildir — planınıza ek bir maliyet gelmez." },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 26, height: 26, background: "#ecfdf5", border: "1.5px solid #86efac", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 13, color: "#15803d", fontWeight: 900 }}>✓</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}

// ─── EMAIL SECTION ────────────────────────────────────────────────────────────

function EmailSection() {
  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
      <div className="lp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

        {/* Sol: E-posta mockup */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 20px 48px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            {/* Tarayıcı çubuğu */}
            <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "3px 10px", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                Gmail · Gelen Kutusu
              </div>
            </div>

            {/* E-posta listesi — 3 satır */}
            <div style={{ borderBottom: "1px solid #e2e8f0" }}>
              {[
                { gun: "0. gün",  konu: "Ödemeniz başarısız oldu",                              unread: true  },
                { gun: "3. gün",  konu: "Size özel teklif: Aboneliğinizi kurtarın",             unread: true  },
                { gun: "7. gün",  konu: "Son şans: Aboneliğiniz bugün sona eriyor",             unread: false },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderBottom: i < 2 ? "1px solid #f1f5f9" : "none",
                    background: i === 0 ? "#f5f3ff" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>M</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: item.unread ? 700 : 500, color: "#0f172a" }}>Metrix</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{item.gun}</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: item.unread ? "#374151" : "#94a3b8", fontWeight: item.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.konu}</p>
                  </div>
                  {item.unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f46e5", flexShrink: 0 }} />}
                </div>
              ))}
            </div>

            {/* Açık e-posta içeriği */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              style={{ padding: "20px 20px 24px" }}
            >
              {/* E-posta başlığı — 3. gün kişisel teklif e-postası */}
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 16 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Size özel teklif: Aboneliğinizi kurtarın</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Metrix &lt;noreply@metrix.com&gt; → zeynep@sirket.com</p>
              </div>
              {/* E-posta gövdesi */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", marginBottom: 14 }}>
                <div style={{ background: "#f59e0b", padding: "10px 14px", marginBottom: 12, textAlign: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>Kişisel Teklifiniz</span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
                  Merhaba <strong>Zeynep</strong>, aboneliğinizi kaybetmemeniz için size özel seçenekler hazırladık:
                </p>
                <div style={{ background: "#059669", padding: "8px", textAlign: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>%30 İndirimi Kabul Et — 3 ay geçerli →</span>
                </div>
                <div style={{ background: "#f59e0b", padding: "8px", textAlign: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Aboneliğimi 30 Gün Dondur →</span>
                </div>
                <div style={{ border: "1px solid #e2e8f0", padding: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Kart Bilgilerimi Güncelle →</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
                Bu e-posta Subkoru üzerinden otomatik gönderildi
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Sağ: Metin */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 } } }}
          initial="hidden"
          whileInView="show"
          viewport={vp}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ede9fe", border: "1px solid #c4b5fd", padding: "6px 14px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.06em" }}>Otomatik E-posta</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.2 }}>
            Siz uyurken e-posta<br />
            <span style={{ color: "#7c3aed" }}>müşteriyi geri getiriyor</span>
          </h2>
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, margin: "0 0 32px" }}>
            Ödeme başarısız olduğu anda, 3. günde ve 7. günde otomatik dunning e-postası gönderilir. Her e-posta müşteriyi kart güncellemeye ve aboneliği kurtarmaya yönlendirir.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { gun: "0. gün",  aciklama: "Anında bildirim — ödeme sorunu + çözüm seçenekleri" },
              { gun: "3. gün",  aciklama: "Kişisel teklif — müşteri profiline göre indirim veya dondurma" },
              { gun: "7. gün",  aciklama: "Son hatırlatma — iptal öncesi son şans mesajı" },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 36, height: 36, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#6d28d9" }}>{i + 1}</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.gun}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{item.aciklama}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { title: "Ödeme kaçırmayın",           desc: "Başarısız ödemeler sizin yerinize takip edilir. Müşteri e-posta ve WhatsApp ile bilgilendirilir — hangi kanalda aktifse orada ulaşılır." },
    { title: "İptal yerine teklif sunun",   desc: "İptal etmek isteyen müşteri gitmeden önce ona özel bir indirim, dondurma veya plan değişikliği teklif edilir." },
    { title: "Giden müşteri geri gelir",    desc: "İptal eden müşteriye belirli gün sonra otomatik 'geri dön' mesajı gönderilir. Hiçbir şey yapmanıza gerek yok." },
    { title: "Anında haberdar olun",        desc: "Müşteri ne yaptı? E-posta mı aldı, teklifi kabul etti mi? Hepsi anında Slack ve e-posta ile size ulaşır." },
    { title: "Markanızı yansıtın",          desc: "Müşteri portali sizin renklerinizde, logonuzla ve başlığınızla açar — Subkoru arka planda kalır." },
    { title: "Neden iptal ettiğini bilin",  desc: "Her müşteri iptal nedenini seçmek zorunda — bu veri hangi sorunu çözmeniz gerektiğini gösterir." },
    { title: "Hiçbir ödeme kaçmasın",       desc: "Kart süresi doldu, limit aştı, hata aldı — ne olursa olsun sistem müşteri ile iletişime geçer ve ödeme yolu açar." },
    { title: "Tüm süreçler otomatik",       desc: "Kurulumdan sonra sisteme dokunmanıza gerek yok. Dunning, teklif, winback — hepsi arka planda çalışır." },
  ];

  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Özellikler</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Aboneliğinizi kaybetmemeniz için her şeyi düşünerek inşa ettik</h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="lp-feat-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#e2e8f0" }}
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} style={{ padding: "32px 28px", background: "#fff" }}>
              <div style={{ width: 36, height: 36, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ width: 16, height: 16, background: "#4f46e5" }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#0f172a" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CALCULATOR ───────────────────────────────────────────────────────────────

function Calculator() {
  const [subscribers, setSubscribers] = useState(500);
  const [price, setPrice] = useState(299);
  const [failRate, setFailRate] = useState(6);

  const failedCount    = Math.round(subscribers * failRate / 100);
  const lostRevenue    = failedCount * price;
  const recovered      = Math.round(lostRevenue * 0.30);
  const ourCut         = Math.round(recovered * 0.10);
  const customerGain   = recovered - ourCut;

  function fmt(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={vp}
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Hesap Makinesi</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>Bu ay ne kadar kaybediyorsunuz?</h2>
          <p style={{ fontSize: 16, color: "#64748b", margin: 0 }}>Rakamlarınızı girin, kaybınızı ve kazancınızı görün.</p>
        </div>

        <div className="lp-calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* Sol: Girişler */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              { label: "Aktif abone sayısı", value: subscribers, setter: setSubscribers, min: 10, max: 50000, step: 10, suffix: "abone" },
              { label: "Ortalama aylık abonelik ücreti", value: price, setter: setPrice, min: 10, max: 10000, step: 10, suffix: "₺" },
              { label: "Aylık başarısız ödeme oranı", value: failRate, setter: setFailRate, min: 1, max: 20, step: 1, suffix: "%" },
            ].map((field) => (
              <div key={field.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{field.label}</label>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
                    {field.suffix === "₺" ? `₺${field.value.toLocaleString("tr-TR")}` : `${field.value.toLocaleString("tr-TR")} ${field.suffix}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.setter(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#4f46e5", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{field.min}{field.suffix === "%" ? "%" : ""}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{field.max.toLocaleString("tr-TR")}{field.suffix === "%" ? "%" : ""}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ: Sonuçlar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Kayıp kutusu */}
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "24px 28px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em" }}>Aylık Kayıp</p>
              <p style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(lostRevenue)}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Ayda <strong style={{ color: "#dc2626" }}>{failedCount} ödeme</strong> başarısız oluyor ve büyük çoğunluğu kaybolup gidiyor.
              </p>
            </div>

            {/* Kurtarılabilir */}
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "24px 28px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subkoru ile Kurtarılabilir</p>
              <p style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(recovered)}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>%30 kurtarma oranı baz alındı.</p>
            </div>

            {/* Net kazanç */}
            <div style={{ background: "#4f46e5", padding: "24px 28px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#c7d2fe", textTransform: "uppercase", letterSpacing: "0.06em" }}>Size Net Kazanç</p>
              <p style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(customerGain)}</p>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#c7d2fe" }}>
                Subkoru payı ({fmt(ourCut)}) düşüldükten sonra.
              </p>
              <a
                href={WA_URL}
                style={{ display: "block", background: "#fff", color: "#4f46e5", padding: "12px", textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: 700 }}
              >
                Bu Kaybı Durduralım →
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section className="lp-section" style={{ padding: "96px 24px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={vp}
        style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Fiyatlandırma</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
          Önce sonucu görün, sonra ödeyin
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, margin: "0 0 48px" }}>
          Başlangıç için upfront maliyet yok. Sisteminize entegre edin, ilk kurtarmayı görüntüleyin. Sadece kurtarılan ödemelerden pay alınır. Sonuçları gördükten sonra devam edip etmeyeceğinize tamamen siz karar verirsiniz — bağlayıcı sözleşme yok.
        </p>

        <div style={{ background: "#fafafa", border: "2px solid #4f46e5", padding: "48px 40px", marginBottom: 24 }}>
          <div style={{ display: "inline-block", background: "#4f46e5", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>
            Başlangıç Paketi
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>%10</div>
          <div style={{ fontSize: 16, color: "#64748b", marginBottom: 32 }}>kurtarılan her ödemeden</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", textAlign: "left", display: "inline-block" }}>
            {[
              "Sınırsız abonelik",
              "Tam özelleştirilmiş portal",
              "Otomatik dunning e-postası",
              "Slack & webhook entegrasyonu",
              "iyzico entegrasyonu",
              "Detaylı analitik pano",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "#374151", marginBottom: 12 }}>
                <div style={{ width: 18, height: 18, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
          <a
            href={WA_URL}
            style={{ display: "block", background: "#4f46e5", color: "#fff", padding: "16px", textAlign: "center", textDecoration: "none", fontSize: 15, fontWeight: 700, letterSpacing: "0.01em" }}
          >
            Hemen Başla — Ücretsiz
          </a>
        </div>

        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Daha fazla abonelik için kurumsal plan görüşmesi yapılabilir.{" "}
          <a href={WA_URL} style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>İletişime geçin →</a>
        </p>
      </motion.div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="lp-section" style={{ background: "#0f172a", padding: "96px 24px", textAlign: "center" }}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={vp}
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.2 }}>
          Bu ay kaç abonelik kaybettiniz?
        </h2>
        <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 40px" }}>
          Çoğu şirket bunu ölçmüyor bile. Bir demo görüşmesinde sistemi canlı gösteririz, kaybınızı hesaplarız.
        </p>
        <a
          href={WA_URL}
          style={{ display: "inline-block", background: "#4f46e5", color: "#fff", padding: "16px 40px", textDecoration: "none", fontSize: 16, fontWeight: 700, letterSpacing: "0.01em" }}
        >
          Ücretsiz Demo İste
        </a>
        <p style={{ marginTop: 16, fontSize: 13, color: "#475569" }}>Yanıt süresi: genellikle 24 saat içinde</p>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1e293b", background: "#0f172a", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Logo size={28} textColor="#fff" />
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/tenant/login" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Giriş Yap</Link>
          <a href={WA_URL} style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>İletişim</a>
        </div>
        <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>© 2026 Subkoru</p>
      </div>
    </footer>
  );
}
