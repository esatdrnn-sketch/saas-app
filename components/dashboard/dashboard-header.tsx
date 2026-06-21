import { Bell, ChevronDown, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-8 py-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Müşteri, fatura veya kampanya ara..."
          className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Bildirimler"
        >
          <Bell className="size-4" />
        </Button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
        >
          <Avatar className="size-8">
            <AvatarFallback className="rounded-full bg-indigo-600 text-xs font-semibold text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">Billing Ops</p>
          </div>
          <ChevronDown className="size-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
