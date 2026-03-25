import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-neon"
            >
              <GraduationCap className="h-6 w-6 text-neon" />
              LearnMyShow
            </Link>
            <p className="mt-3 text-sm text-muted">
              The nation&apos;s leading experiential education and conference
              platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted hover:text-neon"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/attendee"
                  className="text-sm text-muted hover:text-neon"
                >
                  Attendee Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted hover:text-neon"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted hover:text-neon"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted hover:text-neon"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted hover:text-neon"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted hover:text-neon"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-surface-border pt-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} LearnMyShow. All rights reserved.</p>
          <p className="mt-2">
            Want to host an event?{" "}
            <a
              href="mailto:hello@learnmyshow.com"
              className="text-neon hover:underline"
            >
              Drop us an email
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
