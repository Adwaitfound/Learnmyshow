import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  ChevronRight,
  BookOpen,
  Award,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const EVENT = {
  id: "1",
  title: "National EdTech Summit 2025",
  description:
    "The premier gathering of education technology leaders from across the nation. Three days of keynotes, workshops, and deep-dive sessions across multiple tracks.",
  date: "March 15–17, 2025",
  location: "Chicago, IL",
  venue: "McCormick Place Convention Center",
  capacity: 1200,
  price: 299,
  category: "EdTech",
};

const TRACKS = [
  {
    id: "t1",
    name: "Keynote",
    color: "bg-brand-500",
    textColor: "text-brand-700",
    borderColor: "border-brand-200",
    lightBg: "bg-brand-50",
  },
  {
    id: "t2",
    name: "AI & Machine Learning",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
  },
  {
    id: "t3",
    name: "Instructional Design",
    color: "bg-green-500",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    lightBg: "bg-green-50",
  },
  {
    id: "t4",
    name: "Leadership",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    lightBg: "bg-orange-50",
  },
];

const SCHEDULE = [
  {
    time: "09:00 – 10:00",
    sessions: [
      {
        id: "s1",
        trackId: "t1",
        title: "Opening Keynote: The Future of Learning",
        speaker: "Dr. Sarah Chen",
        room: "Main Hall",
        duration: "60 min",
        fullWidth: true,
      },
    ],
  },
  {
    time: "10:30 – 11:30",
    sessions: [
      {
        id: "s2",
        trackId: "t2",
        title: "GPT-4 in the Classroom",
        speaker: "Alex Rivera",
        room: "Hall A",
        duration: "60 min",
        fullWidth: false,
      },
      {
        id: "s3",
        trackId: "t3",
        title: "ADDIE vs. SAM: Modern ID Frameworks",
        speaker: "Jordan Lee",
        room: "Hall B",
        duration: "60 min",
        fullWidth: false,
      },
      {
        id: "s4",
        trackId: "t4",
        title: "Building High-Performance L&D Teams",
        speaker: "Marcus Johnson",
        room: "Hall C",
        duration: "60 min",
        fullWidth: false,
      },
    ],
  },
  {
    time: "12:00 – 13:00",
    sessions: [
      {
        id: "s5",
        trackId: "t1",
        title: "Networking Lunch & Expo",
        speaker: "",
        room: "Expo Hall",
        duration: "60 min",
        fullWidth: true,
      },
    ],
  },
  {
    time: "13:30 – 14:30",
    sessions: [
      {
        id: "s6",
        trackId: "t2",
        title: "Adaptive Learning Platforms Deep Dive",
        speaker: "Priya Patel",
        room: "Hall A",
        duration: "60 min",
        fullWidth: false,
      },
      {
        id: "s7",
        trackId: "t3",
        title: "Microlearning for Retention",
        speaker: "Casey Wang",
        room: "Hall B",
        duration: "60 min",
        fullWidth: false,
      },
      {
        id: "s8",
        trackId: "t4",
        title: "Change Management in EdTech Adoption",
        speaker: "Robin Torres",
        room: "Hall C",
        duration: "60 min",
        fullWidth: false,
      },
    ],
  },
  {
    time: "15:00 – 16:00",
    sessions: [
      {
        id: "s9",
        trackId: "t1",
        title: "Closing Keynote: Learning in 2030",
        speaker: "Dr. James Wright",
        room: "Main Hall",
        duration: "60 min",
        fullWidth: true,
      },
    ],
  },
];

const trackMap = Object.fromEntries(TRACKS.map((t) => [t.id, t]));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id: _id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-brand-200">
            <Link href="/events" className="hover:text-white">
              Events
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{EVENT.title}</span>
          </div>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <Badge
                variant="info"
                className="bg-brand-600/40 text-brand-100"
              >
                {EVENT.category}
              </Badge>
              <h1 className="mt-3 text-4xl font-extrabold">{EVENT.title}</h1>
              <p className="mt-3 text-brand-100">{EVENT.description}</p>
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-brand-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {EVENT.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {EVENT.venue}, {EVENT.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Up to{" "}
                  {EVENT.capacity.toLocaleString()} attendees
                </span>
              </div>
            </div>
            {/* Registration Card */}
            <div className="w-full max-w-xs rounded-2xl border border-brand-600/40 bg-white/10 p-6 backdrop-blur-sm lg:shrink-0">
              <p className="text-3xl font-bold">${EVENT.price}</p>
              <p className="text-sm text-brand-200">
                per person · all tracks included
              </p>
              <Button
                size="lg"
                className="mt-5 w-full bg-white text-brand-800 hover:bg-brand-50 focus:ring-white"
              >
                Register Now
              </Button>
              <div className="mt-4 space-y-2 text-xs text-brand-200">
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" /> Certificate included
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> All session materials
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" /> Virtual access option
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Track Legend */}
        <div className="mb-6 flex flex-wrap gap-3">
          {TRACKS.map((track) => (
            <span
              key={track.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${track.lightBg} ${track.borderColor} ${track.textColor}`}
            >
              <span className={`h-2 w-2 rounded-full ${track.color}`} />
              {track.name}
            </span>
          ))}
        </div>

        {/* Multi-track Agenda */}
        <section>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Multi-track Agenda
          </h2>
          <div className="space-y-6">
            {SCHEDULE.map((slot) => (
              <div key={slot.time} className="flex gap-4">
                {/* Time column */}
                <div className="w-28 shrink-0 pt-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {slot.time}
                  </span>
                </div>

                {/* Sessions */}
                <div
                  className={`flex-1 grid gap-3 ${
                    slot.sessions[0]?.fullWidth
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {slot.sessions.map((session) => {
                    const track = trackMap[session.trackId];
                    return (
                      <div
                        key={session.id}
                        className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${track.lightBg} ${track.borderColor}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold ${track.textColor}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${track.color}`}
                            />
                            {track.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {session.duration}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                          {session.title}
                        </h3>
                        {session.speaker && (
                          <p className="mt-1 text-xs text-gray-600">
                            {session.speaker}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Tag className="h-3 w-3" /> {session.room}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
