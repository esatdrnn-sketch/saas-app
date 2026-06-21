"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f7f6] text-slate-900">
      <SidebarNav />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
