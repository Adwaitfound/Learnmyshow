"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface OverviewData {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalBookings: number;
    totalSessions: number;
    totalRevenue: number;
  };
  usersByRole: { role: string; _count: number }[];
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }[];
  recentBookings: {
    id: string;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string };
    event: { title: string; price: number | null };
  }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load overview");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
        {error || "Failed to load data"}
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      color: "text-neon",
      bg: "bg-neon/10",
    },
    {
      label: "Total Events",
      value: data.stats.totalEvents,
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Revenue",
      value: `₹${data.stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Active Sessions",
      value: data.stats.totalSessions,
      icon: Activity,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
          <ShieldCheck className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-muted">
            Platform-wide overview &amp; management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-surface-border bg-surface-card p-5"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}
            >
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {typeof m.value === "number" ? m.value.toLocaleString() : m.value}
            </p>
            <p className="text-sm text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold text-white">Recent Users</h2>
          <div className="rounded-xl border border-surface-border bg-surface-card divide-y divide-surface-elevated">
            {data.recentUsers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                No users yet
              </p>
            ) : (
              data.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-muted">
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-white">Users by Role</h2>
          <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
            {data.usersByRole.length === 0 ? (
              <p className="text-center text-sm text-muted">No data</p>
            ) : (
              data.usersByRole.map((r) => (
                <div key={r.role}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-300">{r.role}</span>
                    <span className="text-muted">{r._count}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-surface-elevated">
                    <div
                      className="h-2 rounded-full bg-neon"
                      style={{
                        width: `${Math.max(
                          (r._count / Math.max(data.stats.totalUsers, 1)) * 100,
                          2
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="mt-6 mb-3 font-semibold text-white">
            Quick Actions
          </h2>
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-2">
            <a
              href="/dashboard/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <Users className="h-4 w-4" />
              Manage Users &amp; Roles
            </a>
            <a
              href="/dashboard/admin/events"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Manage All Events
            </a>
            <a
              href="/dashboard/admin/payments"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              View All Payments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
