import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

const METRICS = [
  {
    label: "Total Revenue",
    value: "$251,358",
    change: "+18%",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Total Registrations",
    value: "842",
    change: "+12%",
    icon: Users,
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    label: "Events Published",
    value: "1",
    change: "",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Avg. Session Rating",
    value: "4.7 / 5",
    change: "+0.3",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 251358 },
  { month: "Apr", revenue: 0 },
  { month: "May", revenue: 0 },
  { month: "Jun", revenue: 0 },
];

const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="text-gray-500">
          Track revenue and attendance across your events
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${metric.bg}`}
            >
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {metric.value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{metric.label}</p>
              {metric.change && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                  <ArrowUpRight className="h-3 w-3" /> {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart (CSS bar chart) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Revenue Over Time</h2>
        <div className="mt-6 flex items-end gap-3 h-40">
          {REVENUE_DATA.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-brand-500 transition-all"
                style={{
                  height:
                    maxRevenue > 0
                      ? `${(d.revenue / maxRevenue) * 100}%`
                      : "4px",
                  minHeight: "4px",
                }}
              />
              <span className="text-xs text-gray-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
