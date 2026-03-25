import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback handler for Supabase email confirmation.
 * When a user clicks the confirmation link in their email,
 * Supabase redirects them here with a `code` query param.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/attendee";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user role to redirect to correct dashboard
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          const payload = session.access_token.split(".")[1];
          const decoded = JSON.parse(atob(payload));
          const role = decoded?.app_metadata?.role as string | undefined;

          const ROLE_DASHBOARD: Record<string, string> = {
            ATTENDEE: "/dashboard/attendee",
            ORGANIZER: "/dashboard/organizer",
            INSTRUCTOR: "/dashboard/instructor",
            ADMIN: "/dashboard/attendee",
            SUPER_ADMIN: "/dashboard/admin",
          };

          const redirectPath = role ? ROLE_DASHBOARD[role] || next : next;
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } catch {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
