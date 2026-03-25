import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.user.email! } });
}

/* ── GET /api/my/certificates ── User's certificates ─────── */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
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

  const result = certificates.map((c) => ({
    id: c.id,
    title: c.session.title,
    event: c.session.track.event.title,
    issuedAt: c.issuedAt,
    pdfUrl: c.pdfUrl,
    credentialId: `LMS-${c.id.slice(-8).toUpperCase()}`,
  }));

  return NextResponse.json({ certificates: result });
}
