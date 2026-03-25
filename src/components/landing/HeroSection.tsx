"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  venue: string | null;
  city: string | null;
  state: string | null;
  coverImage: string | null;
  price: number | null;
  bookings: number;
  trackCount: number;
  tracks: { name: string; color: string | null }[];
}

interface HeroSectionProps {
  featuredEvents: FeaturedEvent[];
}

export function HeroSection({ featuredEvents }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const count = featuredEvents.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, 4000);
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  function goTo(idx: number) {
    setCurrent(idx);
    startTimer();
  }

  if (count === 0) return null;

  // For the peek effect: we show prev/current/next slide
  const prevIdx = (current - 1 + count) % count;
  const nextIdx = (current + 1) % count;

  return (
    <section className="relative bg-surface overflow-hidden">
      {/* Subtle gradient background behind the banner */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated/50 via-surface to-surface" />

      <div className="relative py-4 sm:py-6">
        {/* ── Banner carousel with side-peek ── */}
        <div className="relative mx-auto max-w-[1400px]">
          {/* Previous / Next buttons */}
          {count > 1 && (
            <>
              <button
                onClick={() => goTo((current - 1 + count) % count)}
                className="absolute left-1 sm:left-2 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo((current + 1) % count)}
                className="absolute right-1 sm:right-2 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Slide container — 3 slides visible (peek left + center + peek right) */}
          <div className="flex items-center justify-center gap-3 px-2 sm:gap-4 sm:px-4">
            {/* Left peek slide */}
            {count > 1 && (
              <button
                onClick={() => goTo(prevIdx)}
                className="hidden sm:block flex-none w-[8%] opacity-50 hover:opacity-70 transition-opacity rounded-xl overflow-hidden"
              >
                <BannerSlide event={featuredEvents[prevIdx]} peek />
              </button>
            )}

            {/* Main center slide */}
            <div className="flex-1 min-w-0 max-w-5xl">
              <Link
                href={`/events/${featuredEvents[current].slug}`}
                className="block group"
              >
                <BannerSlide event={featuredEvents[current]} />
              </Link>
            </div>

            {/* Right peek slide */}
            {count > 1 && (
              <button
                onClick={() => goTo(nextIdx)}
                className="hidden sm:block flex-none w-[8%] opacity-50 hover:opacity-70 transition-opacity rounded-xl overflow-hidden"
              >
                <BannerSlide event={featuredEvents[nextIdx]} peek />
              </button>
            )}
          </div>

          {/* Dot indicators */}
          {count > 1 && (
            <div className="mt-3 sm:mt-4 flex justify-center gap-1.5">
              {featuredEvents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === current
                      ? "h-2 w-5 bg-white"
                      : "h-2 w-2 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Individual banner slide ── */
function BannerSlide({
  event,
  peek = false,
}: {
  event: FeaturedEvent;
  peek?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${
        peek ? "aspect-[16/7]" : "aspect-[2.5/1] sm:aspect-[2.8/1]"
      }`}
    >
      {event.coverImage ? (
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          className="object-cover"
          priority={!peek}
          sizes={peek ? "10vw" : "80vw"}
        />
      ) : (
        /* No-image placeholder — styled event title card */
        <div className="absolute inset-0 bg-gradient-to-br from-neon/20 via-surface-elevated to-surface-card flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #A3FF12 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative text-center px-6">
            <h2
              className={`font-extrabold text-white leading-tight ${
                peek ? "text-sm" : "text-2xl sm:text-4xl lg:text-5xl"
              }`}
            >
              {event.title}
            </h2>
            {!peek && event.description && (
              <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto line-clamp-2">
                {event.description}
              </p>
            )}
            {!peek && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-neon/15 border border-neon/25 px-4 py-1.5 text-xs font-semibold text-neon">
                {new Date(event.startDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {event.city && ` · ${event.city}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
