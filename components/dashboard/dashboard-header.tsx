"use client";

import { Bell, Moon, Search, Sun, User } from "lucide-react";
import { Input } from "@/components/ui/input";

type DashboardHeaderProps = {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
};

export function DashboardHeader({ isDark, setIsDark }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 md:px-8">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Müşteri, fatura veya kampanya ara..."
          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 dark:border-slate-800 dark:bg-slate-950"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Bildirimler"
        >
          <Bell className="size-5" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-rose-500" />
        </button>

        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Tema değiştir"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Profil"
        >
          <User className="size-5" />
        </button>
      </div>
    </header>
  );
}
