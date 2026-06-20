"use client";

import Link from "next/link";
import {
  CreditCard,
  LayoutDashboard,
  Link2,
  RefreshCw,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { label: "Failed Payments", href: "#", icon: CreditCard },
  { label: "Recovery Campaigns", href: "#", icon: RefreshCw },
  { label: "Retained Revenue", href: "#", icon: TrendingUp },
  { label: "Integrations", href: "#", icon: Link2 },
  { label: "Settings", href: "#", icon: Settings },
];

export function SidebarNav() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Churn Recovery
        </p>
        <h1 className="mt-2 text-base font-semibold leading-snug text-slate-900">
          SaaS Churn Recovery
          <span className="block text-sm font-normal text-slate-500">
            &amp; Dunning Dashboard
          </span>
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-medium transition-colors rounded-none",
                item.active
                  ? "border-indigo-100 bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-3 rounded-none">
          <div className="flex size-9 items-center justify-center bg-indigo-600 text-white rounded-none">
            <Wallet className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Bu ay kurtarılan
            </p>
            <p className="text-sm font-semibold text-slate-900">₺128.400</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
