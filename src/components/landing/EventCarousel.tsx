"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselEvent {
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

interface EventCarouselProps {
  events: CarouselEvent[];
  variant?: "neon" | "purple";
}

export function EventCarousel({ events, variant = "neon" }: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const accentBg = variant === "neon" ? "bg-neon" : "bg-purple-400";
  const accentText = variant === "neon" ? "text-neon" : "text-purple-400";
  const accentBgLight = variant === "neon" ? "bg-neon/10" : "bg-purple-500/10";
  const hoverBorder = variant === "neon" ? "hover:border-neon/40" : "hover:border-purple-400/40";
  const shadowHover = variant === "neon" ? "hover:shadow-neon/10" : "hover:shadow-purple-400/10";

  const updateScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el?.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 340;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-surface-border bg-surface-card py-16 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted" />
        <p className="mt-3 text-muted">No events to show yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated/90 border border-surface-border text-white shadow-xl backdrop-blur-sm transition-all hover:bg-surface-elevated hover:scale-110 opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated/90 border border-surface-border text-white shadow-xl backdrop-blur-sm transition-all hover:bg-surface-elevated hover:scale-110 opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Left/right fade */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-[5] w-16 bg-gradient-to-r from-surface to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-[5] w-16 bg-gradient-to-l from-surface to-transparent" />
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((event, idx) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const month = start.toLocaleString("en-IN", { month: "short" }).toUpperCase();
          const day = start.getDate();

          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className={`group relative flex-none w-[320px] snap-start rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all duration-300 ${hoverBorder} hover:-translate-y-1 hover:shadow-xl ${shadowHover}`}
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              {/* Cover Image */}
              {event.coverImage ? (
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/40 to-transparent" />
                  {/* Price badge on image */}
                  <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold ${event.price ? "bg-white/10 backdrop-blur-md text-white" : `${accentBg} text-black`}`}>
                    {event.price ? `₹${event.price.toLocaleString()}` : "Free"}
                  </span>
                  {/* Date badge on image */}
                  <div className={`absolute top-3 left-3 flex flex-col items-center rounded-xl bg-black/60 backdrop-blur-md px-3 py-2`}>
                    <span className={`text-[10px] font-bold ${accentText} tracking-wider`}>
                      {month}
                    </span>
                    <span className="text-xl font-black text-white leading-none">
                      {day}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top accent bar (no-image fallback) */}
                  <div className={`h-1 w-full ${accentBg} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex items-start justify-between px-5 pt-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex flex-col items-center rounded-xl ${accentBgLight} px-3 py-2`}>
                        <span className={`text-[10px] font-bold ${accentText} tracking-wider`}>
                          {month}
                        </span>
                        <span className="text-xl font-black text-white leading-none">
                          {day}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        {days > 1 ? `${days} days` : "1 day"}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${event.price ? "text-white" : accentText}`}>
                      {event.price ? `₹${event.price.toLocaleString()}` : "Free"}
                    </span>
                  </div>
                </>
              )}

              <div className={event.coverImage ? "p-5 pt-0 -mt-4 relative z-10" : "px-5 pb-5"}>
                {/* Duration tag */}
                {event.coverImage && (
                  <span className="text-[10px] text-muted">
                    {days > 1 ? `${days} days` : "1 day"}
                  </span>
                )}

                {/* Title */}
                <h3 className="mt-2 text-base font-semibold text-white line-clamp-2 group-hover:text-neon transition-colors">
                  {event.title}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Track pills */}
                {event.tracks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {event.tracks.map((track) => (
                      <span
                        key={track.name}
                        className={`rounded-full ${accentBgLight} px-2.5 py-0.5 text-[10px] font-medium ${accentText}`}
                      >
                        {track.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                  {(event.city || event.venue) && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {[event.venue, event.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    {event.bookings}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* "View All" card */}
        <Link
          href="/events"
          className={`flex-none w-[320px] snap-start rounded-2xl border-2 border-dashed border-surface-border bg-surface-card/50 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${hoverBorder} hover:bg-surface-card`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${accentBgLight}`}>
            <ChevronRight className={`h-6 w-6 ${accentText}`} />
          </div>
          <span className={`text-sm font-semibold ${accentText}`}>View All Events</span>
        </Link>
      </div>
    </div>
  );
}
