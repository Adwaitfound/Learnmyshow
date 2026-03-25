import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── POST /api/questions ── Submit a question to a session ───── */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sessionId, body: questionBody } = body;

  if (!sessionId || !questionBody)
    return NextResponse.json(
      { error: "sessionId and body are required" },
      { status: 400 }
    );

  // Verify session exists
  const session_record = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!session_record)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const question = await prisma.question.create({
    data: {
      body: questionBody,
      sessionId,
      authorId: user.id,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}

/* ── GET /api/questions?sessionId=X ── List questions for a session ── */
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId)
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );

  const questions = await prisma.question.findMany({
    where: { sessionId },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ questions });
}

/* ── PATCH /api/questions ── Upvote a question ─────────────── */
export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { questionId, action } = body;

  if (!questionId)
    return NextResponse.json(
      { error: "questionId is required" },
      { status: 400 }
    );

  if (action === "upvote") {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ question });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
