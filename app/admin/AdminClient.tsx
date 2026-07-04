"use client";

import { useState } from "react";
import AddTenantForm from "./AddTenantForm";
import AddSubscriptionForm from "./AddSubscriptionForm";
import TenantOffersForm from "./TenantOffersForm";
import TenantSettingsForm from "./TenantSettingsForm";
import SurveyConfigForm from "./SurveyConfigForm";
import TenantUsersForm from "./TenantUsersForm";
import TestimonialsForm from "./TestimonialsForm";
import EmailConfigForm from "./EmailConfigForm";
import ApiKeyDisplay from "./ApiKeyDisplay";
import EmbedCodeDisplay from "./EmbedCodeDisplay";
import styles from "./admin.module.css";

type Tenant = {
  id: string;
  name: string;
  webhookUrl?: string | null;
  notificationEmail?: string | null;
  brandColor?: string | null;
  logoUrl?: string | null;
  portalTitle?: string | null;
  winbackDays?: number;
};

type OnboardingTab = "tenant" | "subscription";
type ConfigTab = "settings" | "offers" | "survey" | "users" | "email" | "testimonials" | "api" | "embed";

export default function AdminClient({ tenants: initial }: { tenants: Tenant[] }) {
  const [tenants, setTenants] = useState<Tenant[]>(initial);
  const [section, setSection] = useState<"onboarding" | "config">("onboarding");
  const [onboardTab, setOnboardTab] = useState<OnboardingTab>("tenant");
  const [configTab, setConfigTab] = useState<ConfigTab>("settings");

  function refreshTenants() {
    fetch("/api/admin/tenants-list")
      .then((r) => r.json())
      .then((d) => d.tenants && setTenants(d.tenants))
      .catch(() => {});
  }

  const simpleTenants = tenants.map(({ id, name }) => ({ id, name }));

  const CONFIG_TABS: { key: ConfigTab; label: string }[] = [
    { key: "settings",     label: "Tenant Ayarları" },
    { key: "offers",       label: "Teklifler" },
    { key: "survey",       label: "Anket Soruları" },
    { key: "users",        label: "Kullanıcılar" },
    { key: "email",        label: "Email Şablonu" },
    { key: "testimonials", label: "Sosyal Kanıt" },
    { key: "api",          label: "API" },
    { key: "embed",        label: "Entegrasyon" },
  ];

  return (
    <div className={styles.onboarding}>
      {/* Bölüm seçici */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["onboarding", "config"] as const).map((s) => (
          <button key={s} className={section === s ? styles.tabActive : styles.tab} onClick={() => setSection(s)}>
            {s === "onboarding" ? "Onboarding" : "Tenant Yapılandırma"}
          </button>
        ))}
      </div>

      {/* Onboarding */}
      {section === "onboarding" && (
        <>
          <div className={styles.tabs}>
            <button className={onboardTab === "tenant" ? styles.tabActive : styles.tab} onClick={() => setOnboardTab("tenant")}>Yeni Tenant Ekle</button>
            <button className={onboardTab === "subscription" ? styles.tabActive : styles.tab} onClick={() => setOnboardTab("subscription")}>Yeni Abonelik Ekle</button>
          </div>
          {onboardTab === "tenant" && (
            <div className={styles.tabContent}>
              <p className={styles.tabDesc}>Platformunuzu kullanan her SaaS şirketi bir tenant olarak eklenir.</p>
              <AddTenantForm onAdded={refreshTenants} />
            </div>
          )}
          {onboardTab === "subscription" && (
            <div className={styles.tabContent}>
              <p className={styles.tabDesc}>Abonelik kaydı oluşturulur; müşterilere portal linki üretilebilir.</p>
              {tenants.length === 0 ? (
                <p className={styles.formError}>Önce bir tenant eklemelisiniz.</p>
              ) : (
                <AddSubscriptionForm tenants={simpleTenants} onAdded={() => {}} />
              )}
            </div>
          )}
        </>
      )}

      {/* Yapılandırma */}
      {section === "config" && (
        <>
          <div className={styles.tabs} style={{ flexWrap: "wrap" }}>
            {CONFIG_TABS.map(({ key, label }) => (
              <button key={key} className={configTab === key ? styles.tabActive : styles.tab} onClick={() => setConfigTab(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {tenants.length === 0 ? (
              <p className={styles.formError}>Önce bir tenant eklemelisiniz.</p>
            ) : (
              <>
                {configTab === "settings" && (
                  <>
                    <p className={styles.tabDesc}>Bildirim emaili, Slack, branding, webhook ve winback ayarları.</p>
                    <TenantSettingsForm tenants={tenants} />
                  </>
                )}
                {configTab === "offers" && (
                  <>
                    <p className={styles.tabDesc}>İptal nedenine göre özel teklif (indirim / dondurma / plan düşürme).</p>
                    <TenantOffersForm tenants={simpleTenants} />
                  </>
                )}
                {configTab === "survey" && (
                  <>
                    <p className={styles.tabDesc}>İptal anketi seçenek başlık ve açıklamalarını özelleştirin.</p>
                    <SurveyConfigForm tenants={simpleTenants} />
                  </>
                )}
                {configTab === "users" && (
                  <>
                    <p className={styles.tabDesc}>Tenant dashboard&apos;una e-posta/şifre ile erişecek kullanıcılar.</p>
                    <TenantUsersForm tenants={simpleTenants} />
                  </>
                )}
                {configTab === "email" && (
                  <>
                    <p className={styles.tabDesc}>Müşterilere gönderilen email görünümünü özelleştirin (gönderen adı, yanıt adresi, alt not).</p>
                    <EmailConfigForm tenants={simpleTenants} />
                  </>
                )}
                {configTab === "testimonials" && (
                  <>
                    <p className={styles.tabDesc}>İptal akışında gösterilecek müşteri yorumları (sosyal kanıt).</p>
                    <TestimonialsForm tenants={simpleTenants} />
                  </>
                )}
                {configTab === "api" && (
                  <>
                    <p className={styles.tabDesc}>Abonelik verilerine programatik erişim için API anahtarı yönetimi.</p>
                    <ApiKeyDisplay tenants={simpleTenants} />
                  </>
                )}
                {configTab === "embed" && (
                  <>
                    <p className={styles.tabDesc}>Müşterinizin ürününe eklenecek in-app iptal akışı — kullanıcı &quot;İptal Et&quot;e basınca Subkoru modalı açılır.</p>
                    <EmbedCodeDisplay tenants={simpleTenants} />
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
