import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // Find the Prisma user by email (Prisma uses cuid, not Supabase UUID)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  return user;
}

/* ── GET /api/events ── List current user's events ─────── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { organizerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { tracks: true, bookings: true } },
      bookings: { where: { status: "CONFIRMED" }, select: { id: true } },
    },
  });

  // Get revenue per event from event price * confirmed bookings
  const eventsWithRevenue = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    venue: e.venue,
    city: e.city,
    state: e.state,
    capacity: e.capacity,
    price: e.price,
    status: e.status,
    coverImage: e.coverImage,
    trackCount: e._count.tracks,
    bookingCount: e._count.bookings,
    revenue: e.price ? Number(e.price) * e.bookings.length : 0,
  }));

  return NextResponse.json({ events: eventsWithRevenue });
}

/* ── POST /api/events ── Create a new event ─────────────── */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, startDate, endDate, venue, city, state, capacity, price, status, recurring } = body;

  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  if (!recurring && (!startDate || !endDate)) {
    return NextResponse.json(
      { error: "startDate and endDate are required for non-recurring events" },
      { status: 400 }
    );
  }

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36);

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description: description || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      venue: venue || null,
      city: city || null,
      state: state || null,
      capacity: capacity ? parseInt(capacity) : null,
      price: price ? parseFloat(price) : null,
      status: status || "DRAFT",
      recurring: recurring || false,
      organizerId: user.id,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
