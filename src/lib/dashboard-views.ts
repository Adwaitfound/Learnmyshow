/* ── Shared dashboard view definitions ─────────────────── */
/* This file has NO "use client" so it can be imported from both
   server components (layout.tsx) and client components (DashboardSwitcher). */

export type DashboardView = "attendee" | "organizer" | "instructor";

export interface ViewMeta {
  key: DashboardView;
  label: string;
  color: string;
  bgColor: string;
  href: string;
}

export const VIEWS: ViewMeta[] = [
  {
    key: "attendee",
    label: "Attendee",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    href: "/dashboard/attendee",
  },
  {
    key: "organizer",
    label: "Organizer",
    color: "text-neon",
    bgColor: "bg-neon/15",
    href: "/dashboard/organizer",
  },
  {
    key: "instructor",
    label: "Instructor",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15",
    href: "/dashboard/instructor",
  },
];

/* Map DB roles → which views they may use */
const ROLE_VIEWS: Record<string, DashboardView[]> = {
  ATTENDEE: ["attendee"],
  ORGANIZER: ["organizer", "instructor", "attendee"],
  INSTRUCTOR: ["instructor", "organizer", "attendee"],
  ADMIN: ["organizer", "instructor", "attendee"],
  SUPER_ADMIN: ["organizer", "instructor", "attendee"],
};

export function getAvailableViews(role: string): ViewMeta[] {
  const keys = ROLE_VIEWS[role] || ["attendee"];
  return VIEWS.filter((v) => keys.includes(v.key));
}

export function getActiveView(pathname: string): DashboardView {
  if (pathname.startsWith("/dashboard/organizer")) return "organizer";
  if (pathname.startsWith("/dashboard/instructor")) return "instructor";
  return "attendee";
}
