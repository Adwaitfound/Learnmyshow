import {
  Search,
  MapPin,
  Calendar,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "National EdTech Summit 2025",
    date: "March 15–17, 2025",
    location: "Chicago, IL",
    attendees: 1200,
    price: 299,
    category: "EdTech",
    status: "PUBLISHED",
    description:
      "The premier gathering of education technology leaders from across the nation.",
  },
  {
    id: "2",
    title: "Future of Learning Conference",
    date: "April 5–6, 2025",
    location: "Austin, TX",
    attendees: 850,
    price: 199,
    category: "Education",
    status: "PUBLISHED",
    description:
      "Two days of inspiring talks and hands-on workshops on the future of learning.",
  },
  {
    id: "3",
    title: "Instructional Design Bootcamp",
    date: "April 22, 2025",
    location: "New York, NY",
    attendees: 300,
    price: 149,
    category: "Workshop",
    status: "PUBLISHED",
    description:
      "An intensive one-day bootcamp on modern instructional design principles.",
  },
  {
    id: "4",
    title: "AI in Education Forum",
    date: "May 10–11, 2025",
    location: "San Francisco, CA",
    attendees: 600,
    price: 249,
    category: "AI & EdTech",
    status: "PUBLISHED",
    description:
      "Explore how artificial intelligence is reshaping classrooms and training programs.",
  },
  {
    id: "5",
    title: "Corporate Learning & Development Summit",
    date: "June 3–4, 2025",
    location: "Dallas, TX",
    attendees: 950,
    price: 349,
    category: "L&D",
    status: "PUBLISHED",
    description:
      "Connect with L&D professionals shaping the future of corporate training.",
  },
  {
    id: "6",
    title: "Higher Education Innovation Conference",
    date: "June 18–19, 2025",
    location: "Boston, MA",
    attendees: 700,
    price: 199,
    category: "Higher Ed",
    status: "PUBLISHED",
    description:
      "Innovations in curriculum design, student engagement, and campus technology.",
  },
];

const categories = [
  "All",
  "EdTech",
  "Education",
  "Workshop",
  "AI & EdTech",
  "L&D",
  "Higher Ed",
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
          <p className="mt-2 text-gray-600">
            Discover thousands of educational events happening nationwide
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, topics, or speakers..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-48"
              />
            </div>
            <Button size="md">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </h3>
                <div className="mt-2 space-y-2">
                  {[
                    "This week",
                    "This month",
                    "Next 3 months",
                    "Custom range",
                  ].map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="date"
                        className="h-3.5 w-3.5 text-brand-600"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Price
                </h3>
                <div className="mt-2 space-y-2">
                  {["Free", "Under $100", "$100–$300", "$300+"].map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded text-brand-600"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Event Map</h3>
              <div className="mt-3 flex h-48 items-center justify-center rounded-lg bg-brand-50 text-center">
                <div>
                  <MapPin className="mx-auto h-8 w-8 text-brand-400" />
                  <p className="mt-2 text-xs text-gray-500">
                    Interactive Mapbox map
                    <br />
                    loads with your token
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Events Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <strong>{SAMPLE_EVENTS.length}</strong> events
              </p>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select className="rounded-lg border border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none">
                  <option>Most Relevant</option>
                  <option>Date: Earliest First</option>
                  <option>Price: Low to High</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {SAMPLE_EVENTS.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-36 rounded-t-2xl bg-gradient-to-br from-brand-600 to-brand-400 p-5">
                    <Badge variant="info" className="bg-white/20 text-white">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">
                      {event.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {event.date}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${event.price}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" /> {event.location}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
