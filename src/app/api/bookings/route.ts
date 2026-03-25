import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── POST /api/bookings ── Register for an event ─────────────── */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { eventId } = body;

  if (!eventId)
    return NextResponse.json(
      { error: "eventId is required" },
      { status: 400 }
    );

  // Verify event exists and is published
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      status: true,
      capacity: true,
      price: true,
      _count: { select: { bookings: true } },
    },
  });

  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (event.status !== "PUBLISHED")
    return NextResponse.json(
      { error: "Event is not open for registration" },
      { status: 400 }
    );

  // Check if already booked
  const existing = await prisma.booking.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });

  if (existing) {
    if (existing.status === "CANCELLED") {
      // Re-activate cancelled booking
      const reactivated = await prisma.booking.update({
        where: { id: existing.id },
        data: {
          status: event.price && Number(event.price) > 0 ? "PENDING" : "CONFIRMED",
          ticketRef: existing.ticketRef || `LMS-${nanoid(8).toUpperCase()}`,
          paidAt:
            !event.price || Number(event.price) === 0 ? new Date() : null,
        },
        include: {
          event: { select: { title: true } },
        },
      });
      return NextResponse.json({ booking: reactivated }, { status: 200 });
    }
    return NextResponse.json(
      { error: "Already registered for this event" },
      { status: 409 }
    );
  }

  // Capacity check
  if (event.capacity) {
    const confirmedCount = await prisma.booking.count({
      where: {
        eventId,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });
    if (confirmedCount >= event.capacity) {
      // Add to waitlist
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          eventId,
          status: "WAITLISTED",
          ticketRef: `LMS-${nanoid(8).toUpperCase()}`,
        },
        include: { event: { select: { title: true } } },
      });
      return NextResponse.json(
        { booking, waitlisted: true },
        { status: 201 }
      );
    }
  }

  // Free events -> auto-confirm; paid -> pending (until payment)
  const isFree = !event.price || Number(event.price) === 0;

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      eventId,
      status: isFree ? "CONFIRMED" : "PENDING",
      ticketRef: `LMS-${nanoid(8).toUpperCase()}`,
      paidAt: isFree ? new Date() : null,
    },
    include: { event: { select: { title: true } } },
  });

  return NextResponse.json({ booking }, { status: 201 });
}

/* ── GET /api/bookings ── List current user's bookings ────────── */
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  // If eventId is provided, return single booking for that event
  if (eventId) {
    const booking = await prisma.booking.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
      select: { id: true, status: true, ticketRef: true, createdAt: true },
    });
    // Only return active bookings (not cancelled)
    if (booking && booking.status !== "CANCELLED") {
      return NextResponse.json({ booking });
    }
    return NextResponse.json({ booking: null });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          endDate: true,
          venue: true,
          city: true,
          coverImage: true,
          price: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}

/* ── DELETE /api/bookings ── Cancel a booking ─────────────────── */
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const eventId = body.eventId;
  const bookingId = body.bookingId || new URL(request.url).searchParams.get("bookingId");

  let booking;
  if (eventId) {
    booking = await prisma.booking.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
    });
  } else if (bookingId) {
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
  }

  if (!booking || booking.userId !== user.id)
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );

  if (booking.status === "CANCELLED")
    return NextResponse.json(
      { error: "Booking is already cancelled" },
      { status: 400 }
    );

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ booking: updated });
}
