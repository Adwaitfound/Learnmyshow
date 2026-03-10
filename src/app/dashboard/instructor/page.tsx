import { Mail, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ROSTER = [
  {
    id: "a1",
    name: "Alice Thompson",
    email: "alice@example.com",
    session: "GPT-4 in the Classroom",
    status: "checked-in",
    avatar: "AT",
  },
  {
    id: "a2",
    name: "Ben Carter",
    email: "ben@example.com",
    session: "GPT-4 in the Classroom",
    status: "registered",
    avatar: "BC",
  },
  {
    id: "a3",
    name: "Clara Nguyen",
    email: "clara@example.com",
    session: "GPT-4 in the Classroom",
    status: "checked-in",
    avatar: "CN",
  },
  {
    id: "a4",
    name: "David Kim",
    email: "david@example.com",
    session: "GPT-4 in the Classroom",
    status: "registered",
    avatar: "DK",
  },
  {
    id: "a5",
    name: "Eva Rossi",
    email: "eva@example.com",
    session: "GPT-4 in the Classroom",
    status: "waitlisted",
    avatar: "ER",
  },
];

export default function InstructorRosterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roster View</h1>
          <p className="text-gray-500">
            Attendees registered for your sessions
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Mail className="mr-1.5 h-3.5 w-3.5" /> Email All
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search attendees..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{ROSTER.length}</p>
          <p className="text-sm text-gray-500">Total Registered</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {ROSTER.filter((a) => a.status === "checked-in").length}
          </p>
          <p className="text-sm text-gray-500">Checked In</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {ROSTER.filter((a) => a.status === "waitlisted").length}
          </p>
          <p className="text-sm text-gray-500">Waitlisted</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Attendee
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Session
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ROSTER.map((attendee) => (
              <tr key={attendee.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                      {attendee.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attendee.name}
                      </p>
                      <p className="text-xs text-gray-500">{attendee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {attendee.session}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    variant={
                      attendee.status === "checked-in"
                        ? "success"
                        : attendee.status === "waitlisted"
                        ? "warning"
                        : "default"
                    }
                  >
                    {attendee.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
