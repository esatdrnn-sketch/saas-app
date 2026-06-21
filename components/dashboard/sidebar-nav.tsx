"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronsRight,
  CreditCard,
  LayoutDashboard,
  Link2,
  RefreshCw,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
  notifs?: number;
};

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Failed Payments",
    sublabel: "Reddedilen Ödemeler",
    href: "#",
    icon: CreditCard,
    notifs: 14,
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
];

const accountNavItems: NavItem[] = [
  {
    label: "Settings",
    sublabel: "Ayarlar",
    href: "#",
    icon: Settings,
  },
];

type SidebarNavProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function SidebarNav({ open, setOpen }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col border-r border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
        open ? "w-64" : "w-16"
      )}
    >
      <TitleSection open={open} />

      <div className="mb-8 flex-1 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavOption
            key={item.label}
            item={item}
            open={open}
            active={pathname === item.href}
          />
        ))}

        {open ? (
          <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Account
            </div>
            {accountNavItems.map((item) => (
              <NavOption key={item.label} item={item} open={open} active={false} />
            ))}
          </div>
        ) : (
          <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
            {accountNavItems.map((item) => (
              <NavOption key={item.label} item={item} open={open} active={false} />
            ))}
          </div>
        )}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
}

function NavOption({
  item,
  open,
  active,
}: {
  item: NavItem;
  open: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={!open ? item.label : undefined}
      className={cn(
        "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
        active
          ? "border-l-2 border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/50 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      <div className="grid h-full w-12 shrink-0 place-content-center">
        <Icon className="size-4" />
      </div>

      {open ? (
        <div className="min-w-0 pr-8">
          <span className="block truncate text-sm font-medium">{item.label}</span>
          {item.sublabel ? (
            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
              {item.sublabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {item.notifs && open ? (
        <span className="absolute right-3 flex size-5 items-center justify-center rounded-full bg-indigo-500 text-xs font-medium text-white dark:bg-indigo-600">
          {item.notifs}
        </span>
      ) : null}
    </Link>
  );
}

function TitleSection({ open }: { open: boolean }) {
  return (
    <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
        <div className="flex items-center gap-3">
          <BrandLogo />
          {open ? (
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                RecoverPanel
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                SaaS Churn Recovery &amp; Dunning
              </span>
            </div>
          ) : null}
        </div>
        {open ? (
          <ChevronDown className="size-4 text-slate-400 dark:text-slate-500" />
        ) : null}
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
      <span className="text-sm font-bold text-white">RP</span>
    </div>
  );
}

function ToggleClose({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
      aria-label={open ? "Sidebar'ı gizle" : "Sidebar'ı göster"}
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={cn(
              "size-4 text-slate-500 transition-transform duration-300 dark:text-slate-400",
              open && "rotate-180"
            )}
          />
        </div>
        {open ? (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Gizle
          </span>
        ) : null}
      </div>
    </button>
  );
}
