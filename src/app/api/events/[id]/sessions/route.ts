import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendSpeakerInvite } from "@/lib/email";
import { Role } from "@prisma/client";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── POST /api/events/[id]/sessions ── Create a session ────── */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && user.role !== Role.SUPER_ADMIN)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, description, startTime, endTime, room, maxAttendees, trackId, instructorEmail } = body;

  if (!title || !startTime || !endTime || !trackId) {
    return NextResponse.json(
      { error: "title, startTime, endTime, and trackId are required" },
      { status: 400 }
    );
  }

  // Verify track belongs to this event
  const track = await prisma.track.findFirst({ where: { id: trackId, eventId: id } });
  if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

  // Look up instructor by email if provided
  let instructorId: string | null = null;
  if (instructorEmail) {
    let instructor = await prisma.user.findUnique({ where: { email: instructorEmail } });

    if (!instructor) {
      // Create a placeholder user with INSTRUCTOR role
      instructor = await prisma.user.create({
        data: {
          email: instructorEmail,
          name: instructorEmail.split("@")[0],
          role: "INSTRUCTOR",
        },
      });
    }

    instructorId = instructor.id;

    // Fetch event info for the email
    const eventRecord = await prisma.event.findUnique({
      where: { id },
      select: { title: true, organizer: { select: { name: true, email: true } } },
    });

    // Send invite/notification email
    sendSpeakerInvite({
      toEmail: instructorEmail,
      eventTitle: eventRecord?.title || "an event",
      sessionTitle: title,
      organizerName: eventRecord?.organizer?.name || eventRecord?.organizer?.email || "An organizer",
    }).catch((err) => console.error("[INVITE EMAIL]", err));
  }

  const session_record = await prisma.session.create({
    data: {
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      room: room || null,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      trackId,
      instructorId,
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      track: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ session: session_record }, { status: 201 });
}

/* ── DELETE /api/events/[id]/sessions ── Delete a session ────── */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && user.role !== Role.SUPER_ADMIN)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.session.delete({ where: { id: sessionId } });
  return NextResponse.json({ success: true });
}

/* ── PATCH /api/events/[id]/sessions ── Update a session ───── */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && user.role !== Role.SUPER_ADMIN)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { sessionId, ...updates } = body;

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  let inviteSent = false;
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.startTime) data.startTime = new Date(updates.startTime);
  if (updates.endTime) data.endTime = new Date(updates.endTime);
  if (updates.room !== undefined) data.room = updates.room;
  if (updates.maxAttendees !== undefined) data.maxAttendees = updates.maxAttendees ? parseInt(updates.maxAttendees) : null;
  if (updates.trackId) data.trackId = updates.trackId;

  if (updates.instructorEmail !== undefined) {
    if (updates.instructorEmail) {
      let instructor = await prisma.user.findUnique({ where: { email: updates.instructorEmail } });

      if (!instructor) {
        // Create a placeholder user with INSTRUCTOR role
        instructor = await prisma.user.create({
          data: {
            email: updates.instructorEmail,
            name: updates.instructorEmail.split("@")[0],
            role: "INSTRUCTOR",
          },
        });
        inviteSent = true;
      }

      data.instructorId = instructor.id;

      // Send invite/notification email (to both new and existing users)
      const sessionRecord = await prisma.session.findUnique({ where: { id: sessionId } });
      const eventRecord = await prisma.event.findUnique({
        where: { id },
        select: { title: true, organizer: { select: { name: true, email: true } } },
      });

      sendSpeakerInvite({
        toEmail: updates.instructorEmail,
        eventTitle: eventRecord?.title || "an event",
        sessionTitle: sessionRecord?.title || updates.title || "a session",
        organizerName: eventRecord?.organizer?.name || eventRecord?.organizer?.email || "An organizer",
      }).catch((err) => console.error("[INVITE EMAIL]", err));
    } else {
      data.instructorId = null;
    }
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data,
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      track: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ session: { ...updated, inviteSent } });
}
