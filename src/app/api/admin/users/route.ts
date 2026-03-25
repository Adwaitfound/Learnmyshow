import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Validates that the current user has SUPER_ADMIN role.
 * Returns the user or an error response.
 */
async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Decode JWT to get role from app_metadata
  try {
    const payload = session.access_token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const role = decoded?.app_metadata?.role;

    if (role !== "SUPER_ADMIN") {
      return { error: NextResponse.json({ error: "Forbidden: SUPER_ADMIN role required" }, { status: 403 }) };
    }

    return { userId: session.user.id, role };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

/* ── GET /api/admin/users ─────────────────────────────────── */
export async function GET(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { bookings: true, organizedEvents: true, instructedSessions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

/* ── PATCH /api/admin/users ── Update user role ──────────── */
export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const { userId, role, name } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (role) updateData.role = role;
  if (name !== undefined) updateData.name = name;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Also update Supabase app_metadata if role changed
  if (role) {
    // Note: This requires service_role key for admin operations.
    // In production, use supabase admin client with SUPABASE_SERVICE_ROLE_KEY
  }

  return NextResponse.json({ user });
}

/* ── DELETE /api/admin/users ── Delete a user ────────────── */
export async function DELETE(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
