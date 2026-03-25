import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ── GET /api/public/events/[slug] ── Single event detail ────── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { name: true, email: true } },
      tracks: {
        orderBy: { createdAt: "asc" },
        include: {
          sessions: {
            orderBy: { startTime: "asc" },
            include: {
              instructor: { select: { name: true, email: true } },
              _count: { select: { resources: true } },
            },
          },
        },
      },
      occurrences: { orderBy: { order: "asc" } },
      _count: { select: { bookings: true } },
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      city: event.city,
      state: event.state,
      coverImage: event.coverImage,
      recurring: event.recurring,
      capacity: event.capacity,
      price: event.price,
      organizer: event.organizer.name,
      attendees: event._count.bookings,
      tracks: event.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color,
        sessions: t.sessions.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          maxAttendees: s.maxAttendees,
          instructor: s.instructor?.name || null,
          resourceCount: s._count.resources,
        })),
      })),
      occurrences: event.occurrences.map((o) => ({
        id: o.id,
        label: o.label,
        startDate: o.startDate,
        endDate: o.endDate,
        order: o.order,
      })),
    },
  });
}
