"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Award,
  Loader2,
  ArrowLeft,
  Repeat,
  Paperclip,
  CheckCircle2,
  XCircle,
  Hourglass,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionDetailModal, SessionInfo } from "@/components/SessionDetailModal";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Track {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sessions: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    room: string | null;
    maxAttendees: number | null;
    instructor: string | null;
    resourceCount?: number;
  }[];
}

interface OccurrenceInfo {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  order: number;
}

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  venue: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
  price: string | null;
  organizer: string | null;
  attendees: number;
  tracks: Track[];
  recurring?: boolean;
  occurrences?: OccurrenceInfo[];
}

const TRACK_COLORS = [
  { bg: "bg-neon/10", border: "border-neon/20", text: "text-neon", dot: "bg-neon" },
  { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", dot: "bg-purple-500" },
  { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", dot: "bg-green-500" },
  { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400", dot: "bg-pink-500" },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["__first__"]));

  // Booking state
  const [bookingStatus, setBookingStatus] = useState<string | null>(null); // CONFIRMED, PENDING, WAITLISTED, CANCELLED or null
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Check existing booking
  const checkBooking = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/bookings?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          setBookingStatus(data.booking.status);
          setBookingRef(data.booking.ticketRef);
        } else {
          setBookingStatus(null);
          setBookingRef(null);
        }
      }
    } catch {
      // Not logged in or no booking — ignore
    }
  }, []);

  async function handleRegister() {
    if (!event) return;
    setIsRegistering(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || "Registration failed");
      } else {
        setBookingStatus(data.booking.status);
        setBookingRef(data.booking.ticketRef);
      }
    } catch {
      setBookingError("Something went wrong");
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleCancel() {
    if (!event) return;
    setIsCancelling(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.ok) {
        setBookingStatus(null);
        setBookingRef(null);
      } else {
        const data = await res.json();
        setBookingError(data.error || "Cancellation failed");
      }
    } catch {
      setBookingError("Something went wrong");
    } finally {
      setIsCancelling(false);
    }
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/public/events/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        // Check if user has existing booking for this event
        checkBooking(data.event.id);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [slug, checkBooking]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
        <Calendar className="h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-white">Event Not Found</h2>
        <p className="mt-1 text-muted">
          This event may have been removed or isn&apos;t published yet.
        </p>
        <Link href="/events" className="mt-4 text-neon hover:underline">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Back to events
        </Link>
      </div>
    );
  }

  // Build a track color map
  const trackColorMap: Record<string, (typeof TRACK_COLORS)[0]> = {};
  event.tracks.forEach((t, i) => {
    trackColorMap[t.id] = TRACK_COLORS[i % TRACK_COLORS.length];
  });

  // --- Day-wise helpers ---
  function toDateKey(d: string | Date) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  function getEventDays(startDate: string, endDate: string) {
    const days: Date[] = [];
    const s = new Date(startDate);
    const e = new Date(endDate);
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    while (cur <= last) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    if (days.length === 0) days.push(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
    return days;
  }

  const isRecurring = event.recurring && event.occurrences && event.occurrences.length > 0;
  const sortedOccurrences = isRecurring
    ? [...event.occurrences!].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    : [];

  const eventDays = getEventDays(event.startDate, event.endDate);
  const isMultiDay = eventDays.length > 1;

  // Group sessions by day → time slot
  type SlotItem = { track: Track; session: Track["sessions"][0] };
  const sessionsByDayAndTime: Record<string, Record<string, SlotItem[]>> = {};

  event.tracks.forEach((track) => {
    track.sessions.forEach((sess) => {
      const dk = toDateKey(sess.startTime);
      const timeKey = `${sess.startTime}__${sess.endTime}`;
      if (!sessionsByDayAndTime[dk]) sessionsByDayAndTime[dk] = {};
      if (!sessionsByDayAndTime[dk][timeKey]) sessionsByDayAndTime[dk][timeKey] = [];
      sessionsByDayAndTime[dk][timeKey].push({ track, session: sess });
    });
  });

  const totalSessions = event.tracks.reduce((s, t) => s + t.sessions.length, 0);
  const location = [event.venue, event.city, event.state].filter(Boolean).join(", ");

  function renderTimeSlots(sortedTimeKeys: string[], daySlots: Record<string, SlotItem[]>) {
    return (
      <div className="space-y-6">
        {sortedTimeKeys.map((key) => {
          const items = daySlots[key];
          const start = new Date(key.split("__")[0]);
          const end = new Date(key.split("__")[1]);
          const timeLabel = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
          return (
            <div key={key} className="flex gap-4">
              <div className="w-28 shrink-0 pt-1">
                <span className="flex items-center gap-1 text-xs font-semibold text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {timeLabel}
                </span>
              </div>
              <div className={`flex-1 grid gap-3 ${items.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {items.map(({ track, session }) => {
                  const c = trackColorMap[track.id];
                  const dur = Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000);
                  return (
                    <div
                      key={session.id}
                      className={`rounded-xl border p-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:scale-[1.02] ${c.bg} ${c.border}`}
                      onClick={() =>
                        setSelectedSession({
                          id: session.id,
                          title: session.title,
                          description: session.description,
                          startTime: session.startTime,
                          endTime: session.endTime,
                          room: session.room,
                          maxAttendees: session.maxAttendees,
                          instructorName: session.instructor,
                          track: { id: track.id, name: track.name, color: track.color || undefined },
                        })
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${c.text}`}>
                          <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                          {track.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="h-3 w-3" /> {dur} min
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-white">{session.title}</h3>
                      {session.instructor && <p className="mt-1 text-xs text-muted">{session.instructor}</p>}
                      <div className="mt-2 flex items-center gap-2">
                        {session.room && (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <MapPin className="h-3 w-3" /> {session.room}
                          </span>
                        )}
                        {(session.resourceCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            <Paperclip className="h-2.5 w-2.5" />
                            {session.resourceCount} material{session.resourceCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-surface via-surface-card to-neon/80 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-neon/60">
            <Link href="/events" className="hover:text-white">
              Events
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate">{event.title}</span>
          </div>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="mt-3 text-4xl font-extrabold">{event.title}</h1>
              {event.description && (
                <p className="mt-3 text-neon/80">{event.description}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-neon/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />{" "}
                  {isRecurring ? (
                    <>{sortedOccurrences.length} dates across the year</>
                  ) : (
                    <>{new Date(event.startDate).toLocaleDateString()}
                    {event.startDate !== event.endDate &&
                      ` – ${new Date(event.endDate).toLocaleDateString()}`}</>
                  )}
                </span>
                {isRecurring && (
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <Repeat className="h-4 w-4" /> Recurring series
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />{" "}
                  {event.attendees} registered
                  {event.capacity
                    ? ` · ${event.capacity} seats`
                    : ""}
                </span>
              </div>
            </div>

            {/* Registration Card */}
            <div className="w-full max-w-xs rounded-2xl border border-neon/40 bg-white/10 p-6 backdrop-blur-sm lg:shrink-0">
              <p className="text-3xl font-bold">
                {event.price
                  ? `₹${parseFloat(event.price).toLocaleString()}`
                  : "Free"}
              </p>
              <p className="text-sm text-neon/60">
                per person · all tracks included
              </p>

              {/* Registration / Status Button */}
              {bookingStatus && bookingStatus !== "CANCELLED" ? (
                <div className="mt-5 space-y-3">
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                    bookingStatus === "CONFIRMED"
                      ? "bg-green-500/15 border border-green-500/30 text-green-400"
                      : bookingStatus === "WAITLISTED"
                      ? "bg-orange-500/15 border border-orange-500/30 text-orange-400"
                      : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400"
                  }`}>
                    {bookingStatus === "CONFIRMED" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : bookingStatus === "WAITLISTED" ? (
                      <Hourglass className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                    {bookingStatus === "CONFIRMED"
                      ? "Registered"
                      : bookingStatus === "WAITLISTED"
                      ? "On Waitlist"
                      : "Pending Payment"}
                  </div>
                  {bookingRef && (
                    <div className="flex items-center gap-2 text-xs text-neon/60">
                      <Ticket className="h-3.5 w-3.5" />
                      Ref: {bookingRef}
                    </div>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="mt-5 w-full bg-surface-card text-neon hover:bg-neon/10 focus:ring-neon"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </Button>
              )}
              {bookingError && (
                <p className="mt-2 text-xs text-red-400">{bookingError}</p>
              )}

              <div className="mt-4 space-y-2 text-xs text-neon/60">
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" /> Certificate included
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {totalSessions} sessions
                  across {event.tracks.length} tracks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Track Legend */}
        {event.tracks.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {event.tracks.map((track) => {
              const c = trackColorMap[track.id];
              return (
                <span
                  key={track.id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${c.bg} ${c.border} ${c.text}`}
                >
                  <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                  {track.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Multi-track Agenda — Day-wise or Occurrence-wise */}
        {totalSessions > 0 ? (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-white">
              {isRecurring ? "Schedule by Occurrence" : "Multi-track Agenda"}
            </h2>

            {/* ── Recurring: group by occurrence ───────── */}
            {isRecurring ? (
              <div className="space-y-4">
                {sortedOccurrences.map((occ, occIdx) => {
                  const occDays = getEventDays(occ.startDate, occ.endDate);
                  const occIsMultiDay = occDays.length > 1;
                  const sectionKey = `occ-${occ.id}`;
                  const isExpanded = occIdx === 0 ? expandedSections.has("__first__") || expandedSections.has(sectionKey) : expandedSections.has(sectionKey);
                  // Count sessions in this occurrence
                  const occSessionCount = occDays.reduce((count, day) => {
                    const dk = toDateKey(day);
                    const slots = sessionsByDayAndTime[dk];
                    if (!slots) return count;
                    return count + Object.values(slots).reduce((s, items) => s + items.length, 0);
                  }, 0);
                  return (
                    <div key={occ.id} className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
                      {/* Clickable occurrence header */}
                      <button
                        onClick={() => {
                          if (occIdx === 0 && expandedSections.has("__first__")) {
                            setExpandedSections((prev) => { const next = new Set(prev); next.delete("__first__"); return next; });
                          } else {
                            toggleSection(sectionKey);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-elevated/50"
                      >
                        <Repeat className="h-5 w-5 text-purple-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white">{occ.label}</h3>
                          <p className="text-sm text-muted">
                            {new Date(occ.startDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                            {occ.startDate !== occ.endDate && ` – ${new Date(occ.endDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`}
                          </p>
                        </div>
                        <span className="rounded-full bg-purple-500/15 border border-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400 shrink-0">
                          {occSessionCount} session{occSessionCount !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                      </button>

                      {/* Collapsible content */}
                      {isExpanded && (
                        <div className="border-t border-surface-border px-5 py-4 space-y-6">
                          {occDays.map((day, dayIdx) => {
                            const dk = toDateKey(day);
                            const daySlots = sessionsByDayAndTime[dk];
                            if (!daySlots) return null;
                            const sortedTimeKeys = Object.keys(daySlots).sort();
                            if (sortedTimeKeys.length === 0) return null;
                            return (
                              <div key={dk}>
                                {occIsMultiDay && (
                                  <div className="mb-3 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-xs font-bold text-muted">{dayIdx + 1}</span>
                                    <p className="text-sm font-medium text-muted">
                                      {day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                    </p>
                                  </div>
                                )}
                                {renderTimeSlots(sortedTimeKeys, daySlots)}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
            /* ── Regular: continuous day-wise ─────────── */
            <div className="space-y-4">
              {eventDays.map((day, dayIdx) => {
                const dk = toDateKey(day);
                const daySlots = sessionsByDayAndTime[dk];
                if (!daySlots) return null;
                const sortedTimeKeys = Object.keys(daySlots).sort();
                if (sortedTimeKeys.length === 0) return null;
                const sectionKey = `day-${dk}`;
                const isExpanded = dayIdx === 0 ? expandedSections.has("__first__") || expandedSections.has(sectionKey) : expandedSections.has(sectionKey);
                const daySessionCount = Object.values(daySlots).reduce((s, items) => s + items.length, 0);

                return (
                  <div key={dk} className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
                    {/* Clickable day header */}
                    <button
                      onClick={() => {
                        if (dayIdx === 0 && expandedSections.has("__first__")) {
                          setExpandedSections((prev) => { const next = new Set(prev); next.delete("__first__"); return next; });
                        } else {
                          toggleSection(sectionKey);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-elevated/50"
                    >
                      {isMultiDay && (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon text-sm font-bold text-black shrink-0">
                          {dayIdx + 1}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white">
                          {isMultiDay ? `Day ${dayIdx + 1}` : day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </h3>
                        {isMultiDay && (
                          <p className="text-sm text-muted">
                            {day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-neon/15 border border-neon/20 px-2.5 py-0.5 text-xs font-medium text-neon shrink-0">
                        {daySessionCount} session{daySessionCount !== 1 ? "s" : ""}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                    </button>

                    {/* Collapsible content */}
                    {isExpanded && (
                      <div className="border-t border-surface-border px-5 py-4">
                        {renderTimeSlots(sortedTimeKeys, daySlots)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </section>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-muted">
              The agenda for this event hasn&apos;t been published yet.
            </p>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          accentColor={selectedSession.track?.color ?? undefined}
        />
      )}
    </div>
  );
}
