"use client";

import Link from "next/link";
import {
  CreditCard,
  LayoutDashboard,
  Link2,
  RefreshCw,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Failed Payments",
    sublabel: "Reddedilen Ödemeler",
    href: "#",
    icon: CreditCard,
  },
  {
    label: "Recovery Campaigns",
    sublabel: "Kurtarma Kampanyaları",
    href: "#",
    icon: RefreshCw,
  },
  {
    label: "Retained Revenue",
    sublabel: "Kurtarılan Ciro",
    href: "#",
    icon: TrendingUp,
  },
  {
    label: "Integrations",
    sublabel: "Stripe / iyzico",
    href: "#",
    icon: Link2,
  },
  {
    label: "Settings",
    sublabel: "Ayarlar",
    href: "#",
    icon: Settings,
  },
];

export function SidebarNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex size-10 items-center justify-center bg-indigo-600 text-sm font-bold text-white rounded-none">
          RP
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          RecoverPanel
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          SaaS Churn Recovery &amp; Dunning
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "block border px-4 py-3 transition-colors rounded-none",
                item.active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.sublabel ? (
                    <p className="text-xs text-slate-500">{item.sublabel}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
