"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white py-6 transition-all duration-300",
        collapsed ? "w-[72px] px-3" : "w-[260px] px-5"
      )}
    >
      {/* Toggle butonu */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 z-10 grid size-6 place-content-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
        aria-label="Sidebar aç/kapat"
      >
        <ChevronLeft
          className={cn("size-3.5 transition-transform duration-300", collapsed && "rotate-180")}
        />
      </button>

      {/* Logo */}
      <Link href="/" className={cn("mb-8 flex items-center gap-3", collapsed ? "px-0 justify-center" : "px-2")}>
        <div className="grid size-9 shrink-0 place-content-center rounded-full bg-[#015021] text-xs font-bold text-white">
          RP
        </div>
        {!collapsed && (
          <span className="truncate text-xl font-bold tracking-tight text-slate-900">
            RecoverPanel
          </span>
        )}
      </Link>

      {!collapsed && (
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Menu
        </div>
      )}

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          General
        </div>
      )}
      {collapsed && <div className="mt-8" />}

      <nav className="space-y-1">
        {generalItems.map((item) => (
          <SidebarLink key={item.label} item={item} active={false} collapsed={collapsed} />
        ))}
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-full py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50",
            collapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-full py-3 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-4",
        active
          ? "bg-[#015021] text-white shadow-sm shadow-emerald-900/20"
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            active ? "bg-white/20 text-white" : "bg-[#015021] text-white"
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
