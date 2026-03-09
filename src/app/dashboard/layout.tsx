import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  FileText,
  Award,
  BarChart2,
  PlusCircle,
  Users,
  MessageSquare,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard/attendee", label: "My Agenda", icon: Calendar },
  {
    href: "/dashboard/attendee/resources",
    label: "Resource Vault",
    icon: FileText,
  },
  {
    href: "/dashboard/attendee/certificates",
    label: "Certificates",
    icon: Award,
  },
  { href: "/dashboard/organizer", label: "Event Builder", icon: PlusCircle },
  {
    href: "/dashboard/organizer/analytics",
    label: "Analytics",
    icon: BarChart2,
  },
  { href: "/dashboard/instructor", label: "My Roster", icon: Users },
  {
    href: "/dashboard/instructor/qa",
    label: "Session Q&A",
    icon: MessageSquare,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-brand-700"
          >
            <GraduationCap className="h-6 w-6 text-brand-600" />
            LearnMyShow
          </Link>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
              Attendee
            </span>
            <div className="h-8 w-8 rounded-full bg-brand-500 text-xs font-bold text-white flex items-center justify-center">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
