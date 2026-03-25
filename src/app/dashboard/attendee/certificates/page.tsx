"use client";

import { useEffect, useState } from "react";
import { Award, Download, Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Certificate {
  id: string;
  url: string | null;
  issuedAt: string;
  session: {
    title: string;
    track: { name: string };
    event: { title: string; startDate: string };
  };
}

export default function AttendeeCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my/certificates");
      if (res.ok) {
        const json = await res.json();
        setCertificates(json.certificates);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Certificates</h1>
        <p className="text-muted">Your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
          <Award className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">
            No certificates yet. Complete sessions to earn them!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-xl border border-surface-border bg-surface-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-muted hover:bg-surface hover:text-neon"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-white">
                {cert.session.title}
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                {cert.session.event.title}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="info">{cert.session.track.name}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Calendar className="h-3 w-3" />
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
