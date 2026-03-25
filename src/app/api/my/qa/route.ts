import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isSuperAdmin(user: { role: string }) {
  return user.role === "SUPER_ADMIN";
}

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/my/qa ── Questions from instructor's sessions ── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const questions = await prisma.question.findMany({
    where: {
      session: { instructorId: user.id },
    },
    orderBy: [{ answered: "asc" }, { upvotes: "desc" }, { createdAt: "desc" }],
    include: {
      session: { select: { title: true } },
    },
  });

  // Try to look up author names for questions that have authorId
  const authorIds = questions.map((q) => q.authorId).filter(Boolean) as string[];
  const authors = authorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a.name || a.email]));

  const result = questions.map((q) => ({
    id: q.id,
    body: q.body,
    author: q.authorId ? authorMap[q.authorId] || "Unknown" : "Anonymous",
    upvotes: q.upvotes,
    answered: q.answered,
    session: q.session.title,
  }));

  return NextResponse.json({ questions: result });
}

/* ── PATCH /api/my/qa ── Mark question as answered ─────────── */
export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { questionId, answered } = body;

  if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });

  // Verify the question belongs to one of this instructor's sessions
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { session: { select: { instructorId: true } } },
  });

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  if (question.session.instructorId !== user.id && !isSuperAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { answered: answered ?? true },
  });

  return NextResponse.json({ question: updated });
}
