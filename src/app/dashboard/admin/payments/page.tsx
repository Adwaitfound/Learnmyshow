"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface BookingRecord {
  id: string;
  amount: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  event: { id: string; title: string };
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "error",
};

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/bookings?${params}`);
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleStatusChange(bookingId: string, status: string) {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    fetchBookings();
  }

  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((s, b) => s + parseFloat(b.amount || "0"), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
          <CreditCard className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Payments & Bookings
          </h1>
          <p className="text-muted">Track revenue, bookings, and refunds</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-muted">Total Bookings</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter((b) => b.status === "CONFIRMED").length}
          </p>
          <p className="text-xs text-muted">Confirmed</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {bookings.filter((b) => b.status === "PENDING").length}
          </p>
          <p className="text-xs text-muted">Pending</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted">Confirmed Revenue</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by user, email, or event..."
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
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface-card p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-muted">No bookings yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Booked
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-elevated">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-elevated">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-muted">
                          {(b.user.name?.[0] || b.user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {b.user.name || "—"}
                          </p>
                          <p className="text-xs text-muted">
                            {b.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {b.event.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white">
                        {b.amount ? `₹${parseFloat(b.amount).toLocaleString()}` : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[b.status] || "default"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {new Date(b.createdAt).toLocaleDateString()}
                      {b.paidAt && (
                        <span className="block text-xs text-green-400">
                          Paid {new Date(b.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "PENDING" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Confirm"
                            onClick={() =>
                              handleStatusChange(b.id, "CONFIRMED")
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          </Button>
                        )}
                        {b.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel / Refund"
                            onClick={() =>
                              handleStatusChange(b.id, "CANCELLED")
                            }
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        )}
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
              {Math.min(page * 20, total)} of {total} bookings
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
