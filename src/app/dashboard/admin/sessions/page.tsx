"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layers,
  Loader2,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface TrackRecord {
  id: string;
  name: string;
  eventTitle: string;
  _count: { sessions: number };
}

interface SessionRecord {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  trackName: string;
  eventTitle: string;
  instructor: { name: string | null; email: string } | null;
}

interface EventOption {
  id: string;
  title: string;
}

export default function AdminSessionsPage() {
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (eventFilter) params.set("eventId", eventFilter);

    const res = await fetch(`/api/admin/sessions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTracks(data.tracks);
      setSessions(data.sessions);
      setEvents(data.events);
    }
    setLoading(false);
  }, [eventFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <Layers className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Tracks & Sessions
          </h1>
          <p className="text-muted">Browse tracks and scheduled sessions</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        >
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      ) : (
        <>
          {/* Tracks Grid */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Tracks ({tracks.length})
            </h2>
            {tracks.length === 0 ? (
              <div className="rounded-xl border border-surface-border bg-surface-card p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-muted">No tracks found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-surface-border bg-surface-card p-5"
                  >
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {t.eventTitle}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted">
                      <Layers className="h-3.5 w-3.5 text-muted" />
                      {t._count.sessions} session
                      {t._count.sessions !== 1 && "s"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions Table */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Sessions ({sessions.length})
            </h2>
            {sessions.length === 0 ? (
              <div className="rounded-xl border border-surface-border bg-surface-card p-8 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-muted">No sessions scheduled</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
                <table className="min-w-full divide-y divide-surface-border">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Session
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Track / Event
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Instructor
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Schedule
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-elevated">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-elevated">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-white">
                            {s.title}
                          </p>
                          {s.description && (
                            <p className="mt-0.5 text-xs text-muted line-clamp-1">
                              {s.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="info">{s.trackName}</Badge>
                          <p className="mt-1 text-xs text-muted">
                            {s.eventTitle}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {s.instructor ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-muted">
                                {(
                                  s.instructor.name?.[0] ||
                                  s.instructor.email[0]
                                ).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm text-white">
                                  {s.instructor.name || s.instructor.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <Clock className="h-3.5 w-3.5 text-muted" />
                            {new Date(s.startTime).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                          <p className="text-xs text-muted">
                            to{" "}
                            {new Date(s.endTime).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
