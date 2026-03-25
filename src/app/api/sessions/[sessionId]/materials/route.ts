import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email! },
  });
}

// GET /api/sessions/:sessionId/materials — list materials for a session
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const resources = await prisma.resource.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resources });
}

// POST /api/sessions/:sessionId/materials — add material
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getAuthUser();
  if (!user || !["ORGANIZER", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  // Verify session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { track: { include: { event: true } } },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Only event organizer, the instructor, or admins can add materials
  const isOrganizer = session.track.event.organizerId === user.id;
  const isInstructor = session.instructorId === user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isOrganizer && !isInstructor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, url, type } = body;

  if (!title || !url || !type) {
    return NextResponse.json(
      { error: "title, url, and type are required" },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.create({
    data: { title, url, type, sessionId },
  });

  return NextResponse.json({ resource }, { status: 201 });
}

// DELETE /api/sessions/:sessionId/materials — delete material (body: { resourceId })
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getAuthUser();
  if (!user || !["ORGANIZER", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  const { resourceId } = await request.json();
  if (!resourceId) {
    return NextResponse.json({ error: "resourceId required" }, { status: 400 });
  }

  // Verify resource belongs to this session
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, sessionId },
    include: { session: { include: { track: { include: { event: true } } } } },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const isOrganizer = resource.session.track.event.organizerId === user.id;
  const isInstructor = resource.session.instructorId === user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isOrganizer && !isInstructor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.resource.delete({ where: { id: resourceId } });

  return NextResponse.json({ success: true });
}
