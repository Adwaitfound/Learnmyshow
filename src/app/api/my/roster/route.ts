import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/my/roster ── Attendees in instructor's sessions ── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all sessions where this user is the instructor
  const sessions = await prisma.session.findMany({
    where: { instructorId: user.id },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      room: true,
      maxAttendees: true,
      track: {
        select: {
          id: true,
          name: true,
          color: true,
          event: {
            select: {
              id: true,
              title: true,
              bookings: {
                where: { status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] } },
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Structured sessions with attendees grouped
  const structuredSessions = sessions.map((s) => ({
    sessionId: s.id,
    sessionTitle: s.title,
    description: s.description,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    maxAttendees: s.maxAttendees,
    trackId: s.track.id,
    trackName: s.track.name,
    trackColor: s.track.color,
    eventTitle: s.track.event.title,
    attendees: s.track.event.bookings.map((b) => ({
      id: b.user.id,
      name: b.user.name,
      email: b.user.email,
    })),
  }));

  // Flat roster (legacy)
  const roster = sessions.flatMap((s) =>
    s.track.event.bookings.map((b) => ({
      id: b.id,
      name: b.user.name,
      email: b.user.email,
      session: s.title,
      sessionId: s.id,
      status: b.status.toLowerCase(),
      avatar: (b.user.name || b.user.email)
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }))
  );

  return NextResponse.json({ roster, sessions: structuredSessions, sessionCount: sessions.length });
}
