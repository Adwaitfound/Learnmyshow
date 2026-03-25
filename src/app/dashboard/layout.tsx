import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  FileText,
  Award,
  BarChart2,
  PlusCircle,
  Users,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Settings,
  Layers,
  Ticket,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth-actions";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher";
import { getAvailableViews } from "@/lib/dashboard-views";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/* Nav items grouped by view */
const VIEW_NAV: Record<string, { href: string; label: string; icon: typeof Calendar }[]> = {
  attendee: [
    { href: "/dashboard/attendee", label: "My Agenda", icon: Calendar },
    { href: "/dashboard/attendee/bookings", label: "My Bookings", icon: Ticket },
    { href: "/dashboard/attendee/resources", label: "Resource Vault", icon: FileText },
    { href: "/dashboard/attendee/certificates", label: "Certificates", icon: Award },
  ],
  organizer: [
    { href: "/dashboard/organizer", label: "Event Builder", icon: PlusCircle },
    { href: "/dashboard/organizer/analytics", label: "Analytics", icon: BarChart2 },
  ],
  instructor: [
    { href: "/dashboard/instructor", label: "My Roster", icon: Users },
    { href: "/dashboard/instructor/qa", label: "Session Q&A", icon: MessageSquare },
  ],
};

const adminNavItems = [
  { href: "/dashboard/admin", label: "Admin Overview", icon: ShieldCheck },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { href: "/dashboard/admin/events", label: "Manage Events", icon: Calendar },
  { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/admin/sessions", label: "Sessions & Tracks", icon: Layers },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();
  const userRole = user?.role || "ATTENDEE";
  const userName = user?.name || user?.email || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const availableViews = getAvailableViews(userRole);

  /* Build all nav items the user can see */
  const allNavGroups = availableViews.map((view) => ({
    view,
    items: VIEW_NAV[view.key] || [],
  }));

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-surface-border bg-surface-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-neon"
          >
            <GraduationCap className="h-6 w-6 text-neon" />
            LearnMyShow
          </Link>
        </div>

        {/* ── View Switcher ─── */}
        <div className="border-b border-surface-border p-3">
          <DashboardSwitcher role={userRole} />
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {allNavGroups.map(({ view, items }) => (
            <div key={view.key} className="mb-3">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {view.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-neon/10 hover:text-neon transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Super Admin Section — only shown to SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="mt-3 border-t border-surface-border pt-4">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-red-400">Super Admin</p>
              <ul className="space-y-0.5">
                {adminNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* User info at bottom of sidebar */}
        <div className="border-t border-surface-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-neon text-xs font-bold text-black flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-muted truncate">{userRole.replace("_", " ")}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-surface-border bg-surface-card px-6">
          <h1 className="font-semibold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            {availableViews.length > 1 && (
              <span className="hidden sm:inline rounded-full bg-surface-elevated px-3 py-1 text-[10px] font-medium text-muted">
                {availableViews.length} views available
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              isSuperAdmin
                ? "bg-red-900/30 text-red-400"
                : "bg-neon/15 text-neon"
            }`}>
              {userRole.replace("_", " ")}
            </span>
            <div className="h-8 w-8 rounded-full bg-neon text-xs font-bold text-black flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
