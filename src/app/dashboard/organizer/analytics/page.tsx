"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface EventSummary {
  id: string;
  title: string;
  status: string;
  bookingCount: number;
  trackCount: number;
  revenue: number;
  capacity: number | null;
  startDate: string;
}

export default function OrganizerAnalyticsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = events.reduce((s, e) => s + e.revenue, 0);
  const totalBookings = events.reduce((s, e) => s + e.bookingCount, 0);
  const totalTracks = events.reduce((s, e) => s + e.trackCount, 0);
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length;

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
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted">Performance overview of your events</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-400 bg-green-500/10",
          },
          {
            label: "Total Registrations",
            value: totalBookings.toString(),
            icon: Users,
            color: "text-blue-400 bg-blue-500/10",
          },
          {
            label: "Published Events",
            value: `${publishedCount} / ${events.length}`,
            icon: Calendar,
            color: "text-purple-400 bg-purple-500/10",
          },
          {
            label: "Total Tracks",
            value: totalTracks.toString(),
            icon: Layers,
            color: "text-orange-400 bg-orange-500/10",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-surface-border bg-surface-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{kpi.label}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}
              >
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Per-Event Breakdown */}
      <div>
        <h2 className="mb-4 font-semibold text-white">Per-Event Breakdown</h2>
        {events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-muted">No events to analyze yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">
                    Bookings
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">
                    Revenue
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">
                    Fill Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-elevated">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-white">{ev.title}</p>
                      <p className="text-xs text-muted">
                        {new Date(ev.startDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          ev.status === "PUBLISHED"
                            ? "success"
                            : ev.status === "CANCELLED"
                            ? "error"
                            : "warning"
                        }
                      >
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-gray-300">
                      {ev.bookingCount}
                      {ev.capacity ? ` / ${ev.capacity}` : ""}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-white">
                      ₹{ev.revenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ev.capacity ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-elevated">
                            <div
                              className="h-full rounded-full bg-neon"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (ev.bookingCount / ev.capacity) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted">
                            {Math.round((ev.bookingCount / ev.capacity) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
