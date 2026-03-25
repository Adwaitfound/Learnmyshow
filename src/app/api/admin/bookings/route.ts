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

/* ── GET /api/admin/bookings ──────────────────────────────── */
export async function GET(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { ticketRef: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { event: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, price: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ bookings, total, page, limit });
}

/* ── PATCH /api/admin/bookings ── Confirm, cancel, refund ── */
export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const { bookingId, status, paidAt } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null;

  // Generate ticket ref on confirmation
  if (status === "CONFIRMED" && !paidAt) {
    updateData.paidAt = new Date();
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } },
    },
  });

  return NextResponse.json({ booking });
}

/* ── DELETE /api/admin/bookings ── Delete a booking ───────── */
export async function DELETE(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  await prisma.booking.delete({ where: { id: bookingId } });

  return NextResponse.json({ success: true });
}
