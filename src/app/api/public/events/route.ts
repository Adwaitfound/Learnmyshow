import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ── GET /api/public/events ── Published events for public pages ── */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // If category filter is a track name
  if (category) {
    where.tracks = { some: { name: { contains: category, mode: "insensitive" } } };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "asc" },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { bookings: true, tracks: true } },
        tracks: { select: { name: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const result = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    venue: e.venue,
    city: e.city,
    state: e.state,
    coverImage: e.coverImage,
    capacity: e.capacity,
    price: e.price,
    organizer: e.organizer.name,
    attendees: e._count.bookings,
    trackCount: e._count.tracks,
    tracks: e.tracks.map((t) => t.name),
  }));

  return NextResponse.json({ events: result, total, page, limit });
}
