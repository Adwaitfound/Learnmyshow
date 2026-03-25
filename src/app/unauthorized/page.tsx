import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <h1 className="mt-4 text-2xl font-bold text-white">Access Denied</h1>
      <p className="mt-2 text-muted max-w-sm">
        You don&apos;t have permission to view this page. Please log in with an
        account that has the required role.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-neon text-neon hover:bg-neon/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon px-4 py-2 text-sm"
        >
          Go Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-neon text-black hover:bg-neon/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon px-4 py-2 text-sm"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
