import { FileText, Download, Search, Video, File } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const RESOURCES = [
  {
    id: "r1",
    title: "ADDIE Framework Guide",
    type: "PDF",
    session: "ADDIE vs. SAM: Modern ID Frameworks",
    event: "National EdTech Summit 2025",
    size: "2.4 MB",
    icon: FileText,
  },
  {
    id: "r2",
    title: "GPT-4 in Education — Slide Deck",
    type: "Slides",
    session: "GPT-4 in the Classroom",
    event: "National EdTech Summit 2025",
    size: "8.1 MB",
    icon: File,
  },
  {
    id: "r3",
    title: "Session Recording — Opening Keynote",
    type: "Video",
    session: "Opening Keynote: The Future of Learning",
    event: "National EdTech Summit 2025",
    size: "1.2 GB",
    icon: Video,
  },
];

export default function ResourceVaultPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Vault</h1>
          <p className="text-gray-500">
            All materials from your attended sessions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Resource list */}
      <div className="space-y-3">
        {RESOURCES.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <resource.icon className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{resource.title}</p>
              <p className="text-sm text-gray-500 truncate">{resource.session}</p>
              <p className="text-xs text-gray-400">{resource.event}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="default">{resource.type}</Badge>
              <span className="text-xs text-gray-400">{resource.size}</span>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
