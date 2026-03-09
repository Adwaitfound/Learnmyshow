import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Award,
  Zap,
  BookOpen,
  TrendingUp,
  Globe,
  ArrowRight,
  Star,
} from "lucide-react";

const stats = [
  { label: "Active Events", value: "2,400+", icon: Calendar },
  { label: "Attendees Nationwide", value: "180K+", icon: Users },
  { label: "Cities Covered", value: "320+", icon: MapPin },
  { label: "Certificates Issued", value: "45K+", icon: Award },
];

const features = [
  {
    icon: Zap,
    title: "Live Multi-track Agendas",
    description:
      "Navigate complex multi-session conferences with an intuitive real-time agenda that syncs across devices.",
    span: "col-span-1 row-span-1",
    bg: "bg-brand-50 border-brand-100",
  },
  {
    icon: MapPin,
    title: "Interactive Event Map",
    description:
      "Discover events near you with a dynamic Mapbox-powered map showing events across every state.",
    span: "col-span-1 row-span-1",
    bg: "bg-green-50 border-green-100",
  },
  {
    icon: Award,
    title: "Instant Certificates",
    description:
      "Earn verified digital certificates the moment you complete a session — shareable on LinkedIn.",
    span: "col-span-1 md:col-span-2 row-span-1",
    bg: "bg-purple-50 border-purple-100",
  },
  {
    icon: BookOpen,
    title: "Resource Vault",
    description:
      "All slides, recordings, and materials from sessions you attended, organized and searchable forever.",
    span: "col-span-1 md:col-span-2 row-span-1",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    icon: TrendingUp,
    title: "Organizer Analytics",
    description:
      "Real-time sales dashboards, attendance heatmaps, and revenue forecasting for event organizers.",
    span: "col-span-1 row-span-1",
    bg: "bg-yellow-50 border-yellow-100",
  },
  {
    icon: Globe,
    title: "Nationwide Reach",
    description:
      "Connect speakers, instructors, and learners from coast to coast on a single unified platform.",
    span: "col-span-1 row-span-1",
    bg: "bg-blue-50 border-blue-100",
  },
];

const upcomingEvents = [
  {
    id: "1",
    title: "National EdTech Summit 2025",
    date: "March 15–17, 2025",
    location: "Chicago, IL",
    attendees: 1200,
    price: 299,
    category: "EdTech",
  },
  {
    id: "2",
    title: "Future of Learning Conference",
    date: "April 5–6, 2025",
    location: "Austin, TX",
    attendees: 850,
    price: 199,
    category: "Education",
  },
  {
    id: "3",
    title: "Instructional Design Bootcamp",
    date: "April 22, 2025",
    location: "New York, NY",
    attendees: 300,
    price: 149,
    category: "Workshop",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/30 px-4 py-1.5 text-sm font-medium text-brand-100 ring-1 ring-brand-400/30">
              <Star className="h-3.5 w-3.5" /> #1 Education Conference Platform
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Learn. Connect.{" "}
              <span className="text-brand-300">Grow.</span>
            </h1>
            <p className="mt-6 text-lg text-brand-100 sm:text-xl">
              Discover thousands of experiential education events, workshops, and
              conferences happening nationwide. Attend, organize, or teach — all
              on one powerful platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-white text-brand-800 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-6 py-3 text-base"
              >
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/organizer"
                className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-white/40 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-6 py-3 text-base"
              >
                Host an Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-7 w-7 text-brand-500" />
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for world-class events
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From discovery to certification — LearnMyShow powers the complete
              learning journey.
            </p>
          </div>

          <div className="mt-14 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.span} ${feature.bg} rounded-2xl border p-6 transition-transform hover:-translate-y-1 hover:shadow-lg`}
              >
                <feature.icon className="h-8 w-8 text-gray-700" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Upcoming Events
              </h2>
              <p className="mt-2 text-gray-600">
                Handpicked experiences happening near you
              </p>
            </div>
            <Link
              href="/events"
              className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
            >
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    {event.category}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${event.price}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-brand-700">
                  {event.title}
                </h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {event.date}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />{" "}
                    {event.attendees.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-700 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to transform your learning journey?
          </h2>
          <p className="mt-4 text-brand-100">
            Join 180,000+ learners, instructors, and organizers on LearnMyShow
            today.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-white text-brand-800 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-6 py-3 text-base"
            >
              Get Started Free
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-white/40 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-6 py-3 text-base"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
