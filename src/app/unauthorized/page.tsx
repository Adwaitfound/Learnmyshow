import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-gray-500 max-w-sm">
        You don&apos;t have permission to view this page. Please log in with an
        account that has the required role.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-brand-600 text-brand-600 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 text-sm"
        >
          Go Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-brand-600 text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 text-sm"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
