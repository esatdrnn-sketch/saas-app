"use client";

import { useRouter } from "next/navigation";

export default function TenantLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/tenant/logout", { method: "POST" });
    router.push("/tenant/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        background: "transparent",
        border: "1.5px solid #e2e8f0",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#6b7280",
        cursor: "pointer",
      }}
    >
      Çıkış
    </button>
  );
}
