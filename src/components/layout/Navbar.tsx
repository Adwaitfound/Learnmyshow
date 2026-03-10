import Link from "next/link";
import { GraduationCap, Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-brand-700"
        >
          <GraduationCap className="h-7 w-7 text-brand-600" />
          <span>LearnMyShow</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/events"
            className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
          >
            Events
          </Link>
          <Link
            href="/dashboard/attendee"
            className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
          >
            My Agenda
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 px-3 py-1.5 text-sm"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-brand-600 text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-3 py-1.5 text-sm"
          >
            Sign Up Free
          </Link>
          <button className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
