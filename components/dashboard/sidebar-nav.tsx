"use client";

import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { label: "Masalar", href: "#", icon: UtensilsCrossed },
  { label: "Siparişler", href: "#", icon: ClipboardList },
  { label: "Menü Yönetimi", href: "#", icon: BookOpen },
  { label: "iyzico Ödemeleri", href: "/admin", icon: CreditCard },
  { label: "Ayarlar", href: "#", icon: Settings },
];

export function SidebarNav() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Churn Recovery
        </p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          Yönetim Paneli
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
        <div className="border border-slate-200 bg-slate-50 px-4 py-3 rounded-none">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Bugün
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            24 aktif sipariş
          </p>
        </div>
      </div>
    </aside>
  );
}
