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

/* ── GET /api/admin/events ────────────────────────────────── */
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
      { title: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { tracks: true, bookings: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}

/* ── POST /api/admin/events ── Create a new event ─────────── */
export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const { title, description, startDate, endDate, venue, city, state, capacity, price, status } = body;

  if (!title || !startDate || !endDate) {
    return NextResponse.json(
      { error: "title, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description: description || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      venue: venue || null,
      city: city || null,
      state: state || null,
      capacity: capacity ? parseInt(capacity) : null,
      price: price ? parseFloat(price) : null,
      status: status || "DRAFT",
      organizerId: auth.userId!,
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { tracks: true, bookings: true } },
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}

/* ── PATCH /api/admin/events ── Update event status, etc ── */
export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const { eventId, ...updateData } = body;

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });

  return NextResponse.json({ event });
}

/* ── DELETE /api/admin/events ── Delete an event ──────────── */
export async function DELETE(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  // Delete cascading: tracks → sessions → resources, questions, certificates
  await prisma.event.delete({ where: { id: eventId } });

  return NextResponse.json({ success: true });
}
