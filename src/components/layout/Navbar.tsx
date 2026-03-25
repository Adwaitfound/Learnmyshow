import Link from "next/link";
import { GraduationCap, LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-actions";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const user = await getCurrentUser();

  const dashboardHref = user
    ? user.role === "SUPER_ADMIN"
      ? "/dashboard/admin"
      : user.role === "ORGANIZER"
      ? "/dashboard/organizer"
      : user.role === "INSTRUCTOR"
      ? "/dashboard/instructor"
      : "/dashboard/attendee"
    : "/dashboard/attendee";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-neon"
        >
          <GraduationCap className="h-7 w-7 text-neon" />
          <span>LearnMyShow</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/events"
            className="text-sm font-medium text-muted hover:text-neon transition-colors"
          >
            Events
          </Link>
          {user && (
            <Link
              href="/dashboard/attendee"
              className="text-sm font-medium text-muted hover:text-neon transition-colors"
            >
              My Agenda
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={dashboardHref}
              className="hidden md:inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors bg-neon text-black hover:bg-neon/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon px-4 py-1.5 text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center rounded-lg font-medium transition-colors text-gray-300 hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon/50 px-3 py-1.5 text-sm"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex items-center justify-center rounded-full font-bold transition-colors bg-neon text-black hover:bg-neon/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon px-3 py-1.5 text-sm"
              >
                Sign Up Free
              </Link>
            </>
          )}
          <MobileNav isLoggedIn={!!user} dashboardHref={dashboardHref} />
        </div>
      </div>
    </nav>
  );
}
