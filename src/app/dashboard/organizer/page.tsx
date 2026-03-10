import {
  PlusCircle,
  Settings,
  Calendar,
  Users,
  FileText,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const MY_EVENTS = [
  {
    id: "e1",
    title: "National EdTech Summit 2025",
    date: "March 15–17, 2025",
    status: "PUBLISHED",
    attendees: 842,
    capacity: 1200,
    revenue: 251358,
  },
  {
    id: "e2",
    title: "Spring Leadership Retreat",
    date: "May 3–4, 2025",
    status: "DRAFT",
    attendees: 0,
    capacity: 200,
    revenue: 0,
  },
];

const WIZARD_STEPS = [
  {
    step: 1,
    label: "Event Details",
    description: "Name, date, venue",
    icon: FileText,
  },
  {
    step: 2,
    label: "Tracks & Sessions",
    description: "Build your agenda",
    icon: Calendar,
  },
  {
    step: 3,
    label: "Speakers",
    description: "Invite instructors",
    icon: Users,
  },
  {
    step: 4,
    label: "Pricing",
    description: "Tickets & capacity",
    icon: Settings,
  },
  { step: 5, label: "Publish", description: "Go live", icon: CheckCircle2 },
];

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Builder</h1>
          <p className="text-gray-500">Create and manage your events</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Event Builder Wizard */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <h2 className="font-semibold text-gray-900">Event Builder Wizard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Follow these steps to create a new event
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.step} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  idx === 0
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step.step}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900">
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
        <Button className="mt-5">
          Start Building <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* My Events */}
      <div>
        <h2 className="mb-4 font-semibold text-gray-900">My Events</h2>
        <div className="space-y-4">
          {MY_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {event.title}
                  </h3>
                  <Badge
                    variant={
                      event.status === "PUBLISHED" ? "success" : "warning"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {event.attendees} /{" "}
                    {event.capacity}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">
                  ${event.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Revenue</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
