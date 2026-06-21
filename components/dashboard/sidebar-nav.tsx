"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Link2,
  LogOut,
  RefreshCw,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

const menuItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Failed Payments", href: "#", icon: CreditCard, badge: 14 },
  { label: "Recovery Campaigns", href: "#", icon: RefreshCw },
  { label: "Retained Revenue", href: "#", icon: TrendingUp },
  { label: "Integrations", href: "#", icon: Link2 },
];

const generalItems: NavItem[] = [
  { label: "Settings", href: "#", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-5 py-6">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-9 place-content-center rounded-full bg-blue-600 text-xs font-bold text-white">
          RP
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          RecoverPanel
        </span>
      </Link>

      <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Menu
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      <div className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        General
      </div>

      <nav className="space-y-1">
        {generalItems.map((item) => (
          <SidebarLink key={item.label} item={item} active={false} />
        ))}
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <LogOut className="size-[18px] shrink-0" />
          Logout
        </button>
      </nav>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-900/20"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            active
              ? "bg-white/20 text-white"
              : "bg-blue-600 text-white"
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
