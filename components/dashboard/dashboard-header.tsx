import { Bell, ChevronDown, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Müşteri, fatura veya kampanya ara..."
          className="border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 rounded-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-200 text-slate-600 rounded-none"
          aria-label="Bildirimler"
        >
          <Bell className="size-4" />
        </Button>

        <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2 rounded-none">
          <Avatar className="size-8 rounded-none">
            <AvatarFallback className="bg-indigo-600 text-xs font-semibold text-white rounded-none">
              CR
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">Ops Manager</p>
            <p className="text-xs text-slate-500">Dunning Team</p>
          </div>
          <ChevronDown className="size-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
