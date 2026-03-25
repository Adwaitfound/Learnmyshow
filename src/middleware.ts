import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin": ["SUPER_ADMIN"],
  "/dashboard/attendee": ["ATTENDEE", "ORGANIZER", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"],
  "/dashboard/organizer": ["ORGANIZER", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"],
  "/dashboard/instructor": ["ORGANIZER", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"],
};

/**
 * Extracts the user's role from a verified Supabase JWT.
 * The role is stored in `app_metadata.role` which is only writable
 * server-side and therefore cannot be spoofed by clients.
 */
function getRoleFromJwt(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    // Role is set via Supabase app_metadata (server-side only)
    return (decoded?.app_metadata?.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  // Use Supabase SSR to validate the session via server-verified JWT
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Extract role from the server-signed JWT (app_metadata is not user-editable)
  const userRole = getRoleFromJwt(session.access_token);
  const allowedRoles = ROLE_ROUTES[matchedRoute];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
