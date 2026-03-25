import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/my/resources ── Resources from user's booked sessions ── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resources = await prisma.resource.findMany({
    where: {
      session: {
        track: {
          event: {
            bookings: { some: { userId: user.id } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        select: {
          title: true,
          track: {
            select: {
              event: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  const result = resources.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    type: r.type,
    session: r.session.title,
    event: r.session.track.event.title,
  }));

  return NextResponse.json({ resources: result });
}
