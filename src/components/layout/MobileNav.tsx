"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Calendar, BookOpen, LogIn, UserPlus } from "lucide-react";

interface MobileNavProps {
  isLoggedIn: boolean;
  dashboardHref: string;
}

export function MobileNav({ isLoggedIn, dashboardHref }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden rounded-md p-2 text-muted hover:bg-surface-elevated"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[101] h-full w-72 transform bg-surface-card border-l border-surface-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <span className="font-bold text-neon text-lg">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-1">
          <Link
            href="/events"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-neon/10 hover:text-neon transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Events
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/dashboard/attendee"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-neon/10 hover:text-neon transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                My Agenda
              </Link>
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neon bg-neon/10 hover:bg-neon/20 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </>
          )}

          {!isLoggedIn && (
            <div className="mt-4 border-t border-surface-border pt-4 space-y-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-surface-elevated transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-black bg-neon hover:bg-neon/80 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Sign Up Free
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
