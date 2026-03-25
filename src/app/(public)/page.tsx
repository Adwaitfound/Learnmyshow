import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EventCarousel } from "@/components/landing/EventCarousel";
import { AnimatedStats } from "@/components/landing/AnimatedStats";
import { HeroSection } from "@/components/landing/HeroSection";

export const dynamic = "force-dynamic";

type EventWithStats = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  venue: string | null;
  city: string | null;
  state: string | null;
  coverImage: string | null;
  price: string | number | Prisma.Decimal | null;
  _count: {
    bookings: number;
    tracks: number;
  };
  tracks: {
    name: string;
    color: string | null;
  }[];
};

export default async function HomePage() {
  let eventCount = 0;
  let userCount = 0;
  let bookingCount = 0;
  let certCount = 0;
  let featuredEvents: EventWithStats[] = [];
  let upcomingEvents: EventWithStats[] = [];
  let recentEvents: EventWithStats[] = [];

  try {
    [eventCount, userCount, bookingCount, certCount, featuredEvents, upcomingEvents, recentEvents] =
      await Promise.all([
        prisma.event.count({ where: { status: "PUBLISHED" } }),
        prisma.user.count(),
        prisma.booking.count(),
        prisma.certificate.count(),
        prisma.event.findMany({
          where: { status: "PUBLISHED", featured: true },
          orderBy: { startDate: "asc" },
          take: 5,
          include: {
            _count: { select: { bookings: true, tracks: true } },
            tracks: { select: { name: true, color: true }, take: 5 },
          },
        }),
        prisma.event.findMany({
          where: { status: "PUBLISHED", startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 8,
          include: {
            _count: { select: { bookings: true, tracks: true } },
            tracks: { select: { name: true, color: true }, take: 3 },
          },
        }),
        prisma.event.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            _count: { select: { bookings: true, tracks: true } },
            tracks: { select: { name: true, color: true }, take: 3 },
          },
        }),
      ]);
  } catch (error) {
    console.error("Prisma query failed in HomePage:", error);
  }

  const stats = [
    { label: "Live Events", value: eventCount, suffix: "+" },
    { label: "Learners", value: userCount, suffix: "+" },
    { label: "Registrations", value: bookingCount, suffix: "" },
    { label: "Certificates", value: certCount, suffix: "" },
  ];

  const serializedFeatured = featuredEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    venue: e.venue,
    city: e.city,
    state: e.state,
    coverImage: e.coverImage,
    price: e.price ? parseFloat(e.price.toString()) : null,
    bookings: e._count.bookings,
    trackCount: e._count.tracks,
    tracks: e.tracks.map((t) => ({ name: t.name, color: t.color })),
  }));

  const serializedUpcoming = upcomingEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    venue: e.venue,
    city: e.city,
    state: e.state,
    coverImage: e.coverImage,
    price: e.price ? parseFloat(e.price.toString()) : null,
    bookings: e._count.bookings,
    trackCount: e._count.tracks,
    tracks: e.tracks.map((t) => ({ name: t.name, color: t.color })),
  }));

  const serializedRecent = recentEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    venue: e.venue,
    city: e.city,
    state: e.state,
    coverImage: e.coverImage,
    price: e.price ? parseFloat(e.price.toString()) : null,
    bookings: e._count.bookings,
    trackCount: e._count.tracks,
    tracks: e.tracks.map((t) => ({ name: t.name, color: t.color })),
  }));

  return (
    <div className="flex flex-col overflow-x-hidden bg-surface">
      {/* ━━━ FEATURED BANNER — BMS-style sliding carousel ━━━ */}
      <HeroSection featuredEvents={serializedFeatured} />

      {/* ━━━ UPCOMING EVENTS — like "Recommended Movies" ━━━ */}
      <section className="pt-8 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-sm font-medium text-neon hover:text-neon/80 transition-colors"
            >
              See All &rsaquo;
            </Link>
          </div>
          <EventCarousel events={serializedUpcoming} />
        </div>
      </section>

      {/* ━━━ RECENTLY ADDED — like "Best of Live Events" ━━━ */}
      {serializedRecent.length > 0 && (
        <section className="pt-4 pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Recently Added
              </h2>
              <Link
                href="/events"
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                See All &rsaquo;
              </Link>
            </div>
            <EventCarousel events={serializedRecent} variant="purple" />
          </div>
        </section>
      )}

      {/* ━━━ STATS + SIGN UP STRIP ━━━ */}
      <section className="border-t border-surface-border bg-surface-card/60 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatedStats stats={stats} />
          <div className="mt-8 text-center">
            <p className="text-sm text-muted mb-4">
              The all-in-one platform for experiential education
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-full font-bold bg-neon text-black px-6 py-2.5 text-sm transition-all hover:shadow-lg hover:shadow-neon/25 hover:scale-105"
              >
                Browse Events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full font-medium border border-surface-border text-gray-300 hover:text-white hover:border-gray-500 px-6 py-2.5 text-sm transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
