"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SessionDetailModal, SessionInfo } from "@/components/SessionDetailModal";

interface Attendee {
  id: string;
  name: string | null;
  email: string;
}

interface SessionWithAttendees {
  sessionId: string;
  sessionTitle: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  room: string | null;
  maxAttendees?: number | null;
  trackId?: string;
  trackName: string;
  trackColor?: string | null;
  eventTitle: string;
  attendees: Attendee[];
}

export default function InstructorDashboardPage() {
  const [sessions, setSessions] = useState<SessionWithAttendees[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my/roster");
      if (res.ok) {
        const json = await res.json();
        setSessions(json.sessions ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const totalAttendees = sessions.reduce(
    (s, sess) => s + sess.attendees.length,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Instructor Dashboard</h1>
        <p className="text-muted">
          Your assigned sessions and attendee roster
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">My Sessions</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {sessions.length}
          </p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Total Attendees</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {totalAttendees}
          </p>
        </div>
      </div>

      {/* Sessions & Rosters */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">
            You haven&apos;t been assigned to any sessions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sessions.map((sess) => (
            <div
              key={sess.sessionId}
              className="rounded-xl border border-surface-border bg-surface-card overflow-hidden"
            >
              {/* Manage Materials button */}
              <div className="flex justify-end px-5 pt-3">
                <button
                  onClick={() => {
                    setSelectedSession({
                      id: sess.sessionId,
                      title: sess.sessionTitle,
                      description: sess.description,
                      startTime: sess.startTime,
                      endTime: sess.endTime,
                      room: sess.room,
                      maxAttendees: sess.maxAttendees,
                      track: sess.trackId
                        ? { id: sess.trackId, name: sess.trackName, color: sess.trackColor }
                        : undefined,
                    });
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-neon/10 px-3 py-1.5 text-xs font-medium text-neon hover:bg-neon/20 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Manage Materials
                </button>
              </div>
              <div className="border-b border-surface-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {sess.sessionTitle}
                  </h3>
                  <Badge variant="info">{sess.trackName}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {sess.eventTitle}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{" "}
                    {new Date(sess.startTime).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    –
                    {new Date(sess.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {sess.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {sess.room}
                    </span>
                  )}
                </div>
              </div>

              {sess.attendees.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">
                  No registered attendees yet
                </p>
              ) : (
                <div className="divide-y divide-surface-border">
                  {sess.attendees.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-5 py-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon/15 text-xs font-bold text-neon">
                        {(a.name?.[0] || a.email[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">
                          {a.name || "Unnamed"}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Mail className="h-3 w-3" /> {a.email}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal for managing materials */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSession(null);
          }}
          editable
          accentColor={selectedSession.track?.color || undefined}
        />
      )}
    </div>
  );
}
