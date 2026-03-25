import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const payload = session.access_token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const role = decoded?.app_metadata?.role;

    if (role !== "SUPER_ADMIN") {
      return {
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { userId: session.user.id };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}

/* ── GET /api/admin/sessions ─────────────────────────────── */
export async function GET(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const trackId = searchParams.get("trackId");

  const trackWhere: Record<string, unknown> = {};
  if (eventId) trackWhere.eventId = eventId;

  const sessionWhere: Record<string, unknown> = {};
  if (trackId) sessionWhere.trackId = trackId;
  if (eventId) sessionWhere.track = { eventId };

  const [tracks, sessions, events] = await Promise.all([
    prisma.track.findMany({
      where: trackWhere,
      include: {
        event: { select: { title: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.session.findMany({
      where: sessionWhere,
      include: {
        track: {
          select: { name: true, color: true, event: { select: { title: true } } },
        },
        instructor: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return NextResponse.json({ tracks, sessions, events });
}
