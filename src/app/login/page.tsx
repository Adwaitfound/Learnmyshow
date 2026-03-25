"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/auth-actions";
import { useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xl text-neon"
          >
            <GraduationCap className="h-7 w-7 text-neon" />
            LearnMyShow
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to your account</p>
        </div>

        {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2.5 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2.5 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              placeholder="••••••••"
            />
          </div>
          <Button className="w-full font-bold" size="md" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-neon hover:text-neon/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
