import {
  Calendar,
  BookOpen,
  Award,
  Bell,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const MY_SESSIONS = [
  {
    id: "s1",
    title: "Opening Keynote: The Future of Learning",
    event: "National EdTech Summit 2025",
    time: "09:00 – 10:00",
    room: "Main Hall",
    track: "Keynote",
    status: "upcoming",
  },
  {
    id: "s2",
    title: "GPT-4 in the Classroom",
    event: "National EdTech Summit 2025",
    time: "10:30 – 11:30",
    room: "Hall A",
    track: "AI & ML",
    status: "upcoming",
  },
  {
    id: "s3",
    title: "Microlearning for Retention",
    event: "National EdTech Summit 2025",
    time: "13:30 – 14:30",
    room: "Hall B",
    track: "Instructional Design",
    status: "upcoming",
  },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    text: "Session 'GPT-4 in the Classroom' starts in 30 minutes",
    time: "Just now",
  },
  {
    id: "n2",
    text: "Your certificate for 'Microlearning Fundamentals' is ready",
    time: "2h ago",
  },
  {
    id: "n3",
    text: "New resource uploaded: ADDIE Framework PDF",
    time: "Yesterday",
  },
];

export default function AttendeeDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Live Agenda</h1>
        <p className="text-gray-500">Track your scheduled sessions for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Calendar className="h-6 w-6 text-brand-500" />
          <p className="mt-3 text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500">Sessions Today</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <BookOpen className="h-6 w-6 text-green-500" />
          <p className="mt-3 text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500">Resources Saved</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Award className="h-6 w-6 text-purple-500" />
          <p className="mt-3 text-2xl font-bold text-gray-900">5</p>
          <p className="text-sm text-gray-500">Certificates Earned</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Session List */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold text-gray-900">
            Today&apos;s Sessions
          </h2>
          <div className="space-y-3">
            {MY_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="mt-0.5 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {session.title}
                    </h3>
                    <Badge variant="info">{session.track}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{session.event}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {session.room}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="mb-3 font-semibold text-gray-900">Notifications</h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            {NOTIFICATIONS.map((notif, i) => (
              <div
                key={notif.id}
                className={`p-4 ${
                  i < NOTIFICATIONS.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <div>
                    <p className="text-sm text-gray-700">{notif.text}</p>
                    <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
