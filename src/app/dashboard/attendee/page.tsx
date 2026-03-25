"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Award,
  FileText,
  Clock,
  MapPin,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface TodaySession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string | null;
  track: string;
  event: string;
  instructor: string | null;
}

interface DashboardData {
  todaySessions: TodaySession[];
  sessionCount: number;
  certificateCount: number;
  resourceCount: number;
}

export default function AttendeeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
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

  const stats = [
    {
      label: "Today's Sessions",
      value: data?.todaySessions?.length ?? 0,
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      label: "Certificates Earned",
      value: data?.certificateCount ?? 0,
      icon: Award,
      color: "text-green-400 bg-green-500/10",
    },
    {
      label: "Resources Available",
      value: data?.resourceCount ?? 0,
      icon: FileText,
      color: "text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
        <p className="text-muted">Welcome back! Here&apos;s your learning overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-surface-border bg-surface-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{s.label}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}
              >
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="mb-4 font-semibold text-white">Today&apos;s Sessions</h2>
        {!data || !data.todaySessions || data.todaySessions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 text-muted">
              No sessions today. Browse events to register!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.todaySessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neon/10">
                  <Calendar className="h-6 w-6 text-neon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{session.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      –
                      {new Date(session.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {session.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {session.room}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="info">{session.track}</Badge>
                  <p className="mt-1 text-xs text-muted">{session.event}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
