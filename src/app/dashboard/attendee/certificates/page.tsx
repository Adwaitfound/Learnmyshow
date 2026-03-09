import { Award, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CERTIFICATES = [
  {
    id: "c1",
    title: "Microlearning Fundamentals",
    event: "Future of Learning Conference",
    issuedAt: "April 6, 2025",
    credentialId: "LMS-2025-MC-001",
    verified: true,
  },
  {
    id: "c2",
    title: "Instructional Design Bootcamp",
    event: "Instructional Design Bootcamp",
    issuedAt: "April 22, 2025",
    credentialId: "LMS-2025-ID-042",
    verified: true,
  },
];

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500">
          Verified digital certificates from your completed sessions
        </p>
      </div>

      {CERTIFICATES.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <Award className="h-12 w-12 text-gray-300" />
          <p className="mt-4 font-medium text-gray-500">No certificates yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Complete sessions to earn certificates
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {CERTIFICATES.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
            >
              {/* Certificate visual */}
              <div className="h-32 bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
                <Award className="h-12 w-12 text-white/80" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                  {cert.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <p className="mt-1 text-sm text-gray-500">{cert.event}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Issued {cert.issuedAt}
                </p>
                <p className="mt-0.5 text-xs font-mono text-gray-400">
                  {cert.credentialId}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
