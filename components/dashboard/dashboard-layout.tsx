"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className={cn(
        "flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        isDark && "dark"
      )}
    >
      <SidebarNav open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <DashboardHeader isDark={isDark} setIsDark={setIsDark} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
