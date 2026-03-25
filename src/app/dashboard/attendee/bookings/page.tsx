"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Ticket,
  Loader2,
  XCircle,
  CheckCircle2,
  Clock,
  Hourglass,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookingEvent {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  venue: string | null;
  city: string | null;
  coverImage: string | null;
  price: string | null;
  status: string;
}

interface BookingItem {
  id: string;
  status: string;
  ticketRef: string | null;
  createdAt: string;
  event: BookingEvent;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-green-500/15 border-green-500/30 text-green-400",
  },
  PENDING: {
    label: "Pending Payment",
    icon: Clock,
    className: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
  },
  WAITLISTED: {
    label: "Waitlisted",
    icon: Hourglass,
    className: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  },
};

export default function AttendeeBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadBookings() {
    const res = await fetch("/api/bookings");
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(bookingId: string, eventId: string) {
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      }
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
        <p className="text-muted">
          {bookings.length} active registration{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-16 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No bookings yet.</p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center gap-1 text-sm text-neon hover:underline"
          >
            Browse Events <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const location = [booking.event.venue, booking.event.city]
              .filter(Boolean)
              .join(", ");
            const isPast = new Date(booking.event.endDate) < new Date();

            return (
              <div
                key={booking.id}
                className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-5 sm:flex-row sm:items-center"
              >
                {/* Cover image */}
                {booking.event.coverImage ? (
                  <Image
                    src={booking.event.coverImage}
                    alt=""
                    width={144}
                    height={96}
                    className="h-24 w-full rounded-lg object-cover sm:w-36 shrink-0"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-lg bg-surface-elevated sm:w-36 shrink-0">
                    <Calendar className="h-8 w-8 text-muted" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/events/${booking.event.slug}`}
                    className="text-lg font-semibold text-white hover:text-neon transition-colors"
                  >
                    {booking.event.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.event.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {location}
                      </span>
                    )}
                    {booking.ticketRef && (
                      <span className="flex items-center gap-1 font-mono">
                        <Ticket className="h-3 w-3" /> {booking.ticketRef}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                    {isPast && (
                      <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs text-muted">
                        Event ended
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/events/${booking.event.slug}`}
                    className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-surface-border"
                  >
                    View Event
                  </Link>
                  {!isPast && (
                    <button
                      onClick={() => handleCancel(booking.id, booking.event.id)}
                      disabled={cancellingId === booking.id}
                      className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
