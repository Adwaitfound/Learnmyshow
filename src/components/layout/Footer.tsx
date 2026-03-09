import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-brand-700"
            >
              <GraduationCap className="h-6 w-6 text-brand-600" />
              LearnMyShow
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              The nation&apos;s leading experiential education and conference
              platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/attendee"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Attendee Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/organizer"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Organizer Tools
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} LearnMyShow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
