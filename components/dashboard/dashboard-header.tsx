"use client";

import { Bell, Mail, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="flex shrink-0 items-center justify-end gap-3 border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative mr-auto w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Müşteri, fatura veya kampanya ara..."
          className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-16 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10"
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          ⌘ F
        </span>
      </div>

      <button
        type="button"
        className="grid size-10 place-content-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Mesajlar"
      >
        <Mail className="size-4" />
      </button>

      <button
        type="button"
        className="relative grid size-10 place-content-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Bildirimler"
      >
        <Bell className="size-4" />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
      </button>

      <Avatar className="size-10 border border-slate-200">
        <AvatarFallback className="rounded-full bg-blue-600 text-xs font-semibold text-white">
          AD
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
