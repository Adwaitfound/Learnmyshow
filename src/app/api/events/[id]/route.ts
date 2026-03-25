import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isSuperAdmin(user: { role: string }) {
  return user.role === "SUPER_ADMIN";
}

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  return user;
}

/* ── GET /api/events/[id] ── Full event with tracks & sessions ─── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { createdAt: "asc" },
        include: {
          sessions: {
            orderBy: { startTime: "asc" },
            include: {
              instructor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
      occurrences: { orderBy: { order: "asc" } },
      _count: { select: { bookings: true } },
      bookings: {
        where: { status: "CONFIRMED" },
        select: { id: true },
      },
    },
  });

  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Verify ownership or super admin
  if (event.organizerId !== user.id && !isSuperAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const revenue = event.price
    ? Number(event.price) * event.bookings.length
    : 0;

  return NextResponse.json({
    event: {
      ...event,
      bookings: undefined,
      revenue,
      confirmedBookings: event.bookings.length,
    },
  });
}

/* ── PATCH /api/events/[id] ── Update event details ────────── */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (existing.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const allowedFields = [
    "title",
    "description",
    "startDate",
    "endDate",
    "venue",
    "city",
    "state",
    "capacity",
    "price",
    "status",
    "coverImage",
    "featured",
    "recurring",
  ];

  // Organizers cannot directly publish — they can only request review
  if (body.status === "PUBLISHED" && !isSuperAdmin(user)) {
    return NextResponse.json(
      { error: "Only admins can publish events. Use 'Request Review' instead." },
      { status: 403 }
    );
  }

  // Only super admins can toggle featured
  if (body.featured !== undefined && !isSuperAdmin(user)) {
    return NextResponse.json(
      { error: "Only admins can feature events." },
      { status: 403 }
    );
  }

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      if (key === "startDate" || key === "endDate")
        data[key] = new Date(body[key]);
      else if (key === "capacity")
        data[key] = body[key] ? parseInt(body[key]) : null;
      else if (key === "price")
        data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key];
    }
  }

  const event = await prisma.event.update({ where: { id }, data });
  return NextResponse.json({ event });
}

/* ── DELETE /api/events/[id] ── Delete event & cascade ──── */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (existing.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete bookings first (no cascade on bookings)
  await prisma.booking.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
