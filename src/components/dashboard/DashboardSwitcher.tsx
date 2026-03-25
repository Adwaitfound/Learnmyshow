"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Ticket,
  PlusCircle,
  Mic2,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  type DashboardView,
  VIEWS,
  getAvailableViews,
  getActiveView,
} from "@/lib/dashboard-views";

/* Icons live here (client-only) so server code never touches them */
const VIEW_ICONS: Record<DashboardView, LucideIcon> = {
  attendee: Ticket,
  organizer: PlusCircle,
  instructor: Mic2,
};

/* ── Switcher dropdown ────────────────────────────────── */
export function DashboardSwitcher({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const views = getAvailableViews(role);
  const active = getActiveView(pathname);
  const activeMeta = VIEWS.find((v) => v.key === active) || VIEWS[0];
  const ActiveIcon = VIEW_ICONS[activeMeta.key];

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Single view → no switcher needed
  if (views.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-surface-elevated px-3 py-2">
        <ActiveIcon className={`h-4 w-4 ${activeMeta.color}`} />
        <span className="text-sm font-medium text-white">{activeMeta.label}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 transition-colors hover:border-neon/30"
      >
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${activeMeta.bgColor}`}>
            <ActiveIcon className={`h-4 w-4 ${activeMeta.color}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{activeMeta.label}</p>
            <p className="text-[10px] text-muted">Dashboard</p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-surface-border bg-surface-card p-1 shadow-xl">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Switch View
          </p>
          {views.map((v) => {
            const Icon = VIEW_ICONS[v.key];
            return (
              <button
                key={v.key}
                onClick={() => {
                  router.push(v.href);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
                  v.key === active
                    ? "bg-surface-elevated text-white"
                    : "text-gray-400 hover:bg-surface-elevated hover:text-white"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${v.bgColor}`}>
                  <Icon className={`h-3.5 w-3.5 ${v.color}`} />
                </div>
                <span className="font-medium">{v.label}</span>
                {v.key === active && (
                  <LayoutDashboard className="ml-auto h-3.5 w-3.5 text-neon" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
