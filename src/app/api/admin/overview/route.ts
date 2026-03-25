import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = session.access_token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const role = decoded?.app_metadata?.role;

    if (role !== "SUPER_ADMIN") {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { userId: session.user.id };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

/* ── GET /api/admin/overview ── Platform-wide stats ───────── */
export async function GET() {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const [
    totalUsers,
    totalEvents,
    totalBookings,
    totalSessions,
    usersByRole,
    eventsByStatus,
    bookingsByStatus,
    recentUsers,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count(),
    prisma.session.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.event.groupBy({ by: ["status"], _count: true }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, price: true } },
      },
    }),
  ]);

  // Calculate total revenue from confirmed bookings
  const confirmedBookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    include: { event: { select: { price: true } } },
  });

  const totalRevenue = confirmedBookings.reduce((sum, b) => {
    return sum + (b.event.price ? Number(b.event.price) : 0);
  }, 0);

  return NextResponse.json({
    stats: {
      totalUsers,
      totalEvents,
      totalBookings,
      totalSessions,
      totalRevenue,
    },
    usersByRole,
    eventsByStatus,
    bookingsByStatus,
    recentUsers,
    recentBookings,
  });
}
