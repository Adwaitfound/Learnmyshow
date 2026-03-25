"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  Users,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface PublicEvent {
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
  trackCount: number;
  tracks: string[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("page", page.toString());
    params.set("limit", "12");
    const res = await fetch(`/api/public/events?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, category, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  }

  const categories = ["All", "Keynote", "Workshop", "AI", "Leadership", "Design"];

  return (
    <div className="min-h-screen bg-surface">
      {/* Page Header */}
      <div className="bg-surface-card border-b border-surface-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Browse Events</h1>
          <p className="mt-2 text-muted">
            Discover educational events, workshops, and conferences
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, topics, or locations..."
                className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 py-2.5 pl-10 pr-4 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <Button type="submit" size="md">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center gap-2 font-semibold text-white">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Category / Track
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat === "All" ? "" : cat);
                        setPage(1);
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        (cat === "All" && !category) || category === cat
                          ? "border-neon bg-neon/10 text-neon"
                          : "border-surface-border text-gray-300 hover:border-neon hover:text-neon"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Events Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                Showing <strong>{events.length}</strong> of{" "}
                <strong>{total}</strong> events
              </p>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted" />
                <span className="text-xs text-muted">Sorted by date</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-neon" />
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-16 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-muted">
                  No events found. Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group flex flex-col rounded-2xl border border-surface-border bg-surface-card shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 hover:border-neon/30"
                    >
                      <div className="h-36 rounded-t-2xl bg-gradient-to-br from-neon to-neon/60 p-5">
                        {event.tracks[0] && (
                          <Badge
                            variant="info"
                            className="bg-white/20 text-white"
                          >
                            {event.tracks[0]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-semibold text-white group-hover:text-neon">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="mt-1.5 text-sm text-muted line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-auto pt-4 flex items-center justify-between text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />{" "}
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <span className="font-semibold text-neon">
                            {event.price
                              ? `₹${parseFloat(event.price).toLocaleString()}`
                              : "Free"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted">
                          {(event.city || event.venue) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />{" "}
                              {[event.city, event.state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {event.attendees}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted">
                      Page {page} of {Math.ceil(total / 12)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= Math.ceil(total / 12)}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
