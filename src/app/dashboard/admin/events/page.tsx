"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Search,
  Trash2,
  Ban,
  CheckCircle2,
  Users,
  MapPin,
  DollarSign,
  PlusCircle,
  Loader2,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface EventRecord {
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
  status: string;
  featured: boolean;
  organizer: { id: string; name: string | null; email: string };
  _count: { tracks: number; bookings: number };
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  DRAFT: "warning",
  PENDING_REVIEW: "info",
  PUBLISHED: "success",
  CANCELLED: "error",
  COMPLETED: "info",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/events?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      venue: form.get("venue"),
      city: form.get("city"),
      state: form.get("state"),
      capacity: form.get("capacity"),
      price: form.get("price"),
      status: form.get("status"),
    };

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowCreate(false);
      fetchEvents();
    }
    setCreating(false);
  }

  async function handleStatusChange(eventId: string, status: string) {
    await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status }),
    });
    fetchEvents();
  }

  async function handleToggleFeatured(eventId: string, currentFeatured: boolean) {
    await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !currentFeatured }),
    });
    fetchEvents();
  }

  async function handleDelete(eventId: string) {
    if (!confirm("Delete this event and all its tracks, sessions, and bookings?")) return;
    await fetch(`/api/admin/events?eventId=${eventId}`, { method: "DELETE" });
    fetchEvents();
  }

  const totalRevenue = events.reduce(
    (s, e) => s + (e.price ? parseFloat(e.price) * e._count.bookings : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Calendar className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Events</h1>
            <p className="text-muted">
              Create, edit, publish, or cancel events
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Create New Event
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded hover:bg-surface-elevated"
              >
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Start Date *
                  </label>
                  <input
                    name="startDate"
                    type="datetime-local"
                    required
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    End Date *
                  </label>
                  <input
                    name="endDate"
                    type="datetime-local"
                    required
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Venue
                  </label>
                  <input
                    name="venue"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    City
                  </label>
                  <input
                    name="city"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    State
                  </label>
                  <input
                    name="state"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Price (₹)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="DRAFT"
                    className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-muted">Total Events</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {events.filter((e) => e.status === "PUBLISHED").length}
          </p>
          <p className="text-xs text-muted">Published</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {events.reduce((s, e) => s + e._count.bookings, 0)}
          </p>
          <p className="text-xs text-muted">Total Bookings</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted">Est. Revenue</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 py-2.5 pl-10 pr-4 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface-card p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-muted">No events yet</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Event
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Dates
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Bookings
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Price
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-elevated">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-surface-elevated">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        {event.title}
                      </p>
                      {event.city && (
                        <p className="flex items-center gap-1 text-xs text-muted">
                          <MapPin className="h-3 w-3" /> {event.city}
                          {event.state ? `, ${event.state}` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[event.status] || "default"}>
                        {event.status === "PENDING_REVIEW" ? "PENDING REVIEW" : event.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.startDate !== event.endDate && (
                        <>
                          <br />
                          <span className="text-xs text-muted">
                            to {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Users className="h-3.5 w-3.5 text-muted" />
                        {event._count.bookings}
                        {event.capacity && (
                          <span className="text-muted">
                            / {event.capacity}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-white">
                        {event.price ? (
                          <>
                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                            ₹{parseFloat(event.price).toLocaleString()}
                          </>
                        ) : (
                          <span className="text-muted">Free</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title={event.featured ? "Remove from homepage highlight" : "Highlight on homepage"}
                          onClick={() => handleToggleFeatured(event.id, event.featured)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            event.featured
                              ? "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/25"
                              : "bg-surface-elevated text-muted border border-surface-border hover:text-yellow-400 hover:border-yellow-400/30"
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              event.featured
                                ? "fill-yellow-400 text-yellow-400"
                                : ""
                            }`}
                          />
                          {event.featured ? "Highlighted" : "Highlight"}
                        </button>
                        {event.status === "PENDING_REVIEW" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Approve & Publish"
                              onClick={() =>
                                handleStatusChange(event.id, "PUBLISHED")
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Reject (back to Draft)"
                              onClick={() =>
                                handleStatusChange(event.id, "DRAFT")
                              }
                            >
                              <Ban className="h-3.5 w-3.5 text-yellow-500" />
                            </Button>
                          </>
                        )}
                        {event.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Publish"
                            onClick={() =>
                              handleStatusChange(event.id, "PUBLISHED")
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          </Button>
                        )}
                        {event.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel"
                            onClick={() =>
                              handleStatusChange(event.id, "CANCELLED")
                            }
                          >
                            <Ban className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Showing {(page - 1) * 20 + 1}–
              {Math.min(page * 20, total)} of {total} events
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
