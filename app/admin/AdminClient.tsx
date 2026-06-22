"use client";

import { useState } from "react";
import AddTenantForm from "./AddTenantForm";
import AddSubscriptionForm from "./AddSubscriptionForm";
import styles from "./admin.module.css";

type Tenant = { id: string; name: string };

export default function AdminClient({ tenants: initial }: { tenants: Tenant[] }) {
  const [tenants, setTenants] = useState<Tenant[]>(initial);
  const [activeTab, setActiveTab] = useState<"tenant" | "subscription">("tenant");

  function refreshTenants() {
    fetch("/api/admin/tenants-list")
      .then((r) => r.json())
      .then((d) => d.tenants && setTenants(d.tenants))
      .catch(() => {});
  }

  return (
    <div className={styles.onboarding}>
      <div className={styles.tabs}>
        <button
          className={activeTab === "tenant" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("tenant")}
        >
          Yeni Tenant Ekle
        </button>
        <button
          className={activeTab === "subscription" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("subscription")}
        >
          Yeni Abonelik Ekle
        </button>
      </div>

      {activeTab === "tenant" && (
        <div className={styles.tabContent}>
          <p className={styles.tabDesc}>
            Platformunuzu kullanan her SaaS şirketi bir tenant olarak eklenir.
          </p>
          <AddTenantForm onAdded={refreshTenants} />
        </div>
      )}

      {activeTab === "subscription" && (
        <div className={styles.tabContent}>
          <p className={styles.tabDesc}>
            Abonelik kaydı oluşturulur; müşterilere portal linki üretilebilir.
          </p>
          {tenants.length === 0 ? (
            <p className={styles.formError}>Önce bir tenant eklemelisiniz.</p>
          ) : (
            <AddSubscriptionForm tenants={tenants} onAdded={() => {}} />
          )}
        </div>
      )}
    </div>
  );
}
