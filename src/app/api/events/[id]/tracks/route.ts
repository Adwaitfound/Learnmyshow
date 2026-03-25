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
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/events/[id]/tracks ── List tracks for an event ── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tracks = await prisma.track.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { sessions: true } },
      sessions: {
        orderBy: { startTime: "asc" },
        include: {
          instructor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ tracks });
}

/* ── POST /api/events/[id]/tracks ── Create a track ──────────── */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, description, color } = body;

  if (!name) {
    return NextResponse.json({ error: "Track name is required" }, { status: 400 });
  }

  const track = await prisma.track.create({
    data: {
      name,
      description: description || null,
      color: color || null,
      eventId: id,
    },
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json({ track }, { status: 201 });
}

/* ── PATCH /api/events/[id]/tracks ── Update a track ─────────── */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { trackId, name, description, color } = body;

  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description || null;
  if (color !== undefined) data.color = color || null;

  const track = await prisma.track.update({
    where: { id: trackId },
    data,
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json({ track });
}

/* ── DELETE /api/events/[id]/tracks ── Delete a track ────────── */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");

  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organizerId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.track.delete({ where: { id: trackId } });
  return NextResponse.json({ success: true });
}
