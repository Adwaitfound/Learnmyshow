import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/my/dashboard ── Aggregate data for attendee dashboard ── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Sessions from booked events (today)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, status: { in: ["CONFIRMED", "PENDING"] } },
    select: {
      event: {
        select: {
          id: true,
          title: true,
          tracks: {
            select: {
              sessions: {
                where: {
                  startTime: { gte: startOfDay },
                  endTime: { lte: endOfDay },
                },
                orderBy: { startTime: "asc" },
                include: {
                  track: { select: { name: true } },
                  instructor: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const todaySessions = bookings.flatMap((b) =>
    b.event.tracks.flatMap((t) =>
      t.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        event: b.event.title,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
        track: s.track.name,
        instructor: s.instructor?.name || null,
      }))
    )
  );

  // Certificates count
  const certificateCount = await prisma.certificate.count({
    where: { userId: user.id },
  });

  // Resources from booked sessions
  const resourceCount = await prisma.resource.count({
    where: {
      session: {
        track: {
          event: {
            bookings: { some: { userId: user.id } },
          },
        },
      },
    },
  });

  return NextResponse.json({
    todaySessions,
    sessionCount: todaySessions.length,
    certificateCount,
    resourceCount,
  });
}
