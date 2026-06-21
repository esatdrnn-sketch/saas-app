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
        "flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        isDark && "dark"
      )}
    >
      <SidebarNav open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardHeader isDark={isDark} setIsDark={setIsDark} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="flex w-full min-w-0 flex-col gap-6 md:gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
