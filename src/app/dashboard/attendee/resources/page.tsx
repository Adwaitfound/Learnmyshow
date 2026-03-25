"use client";

import { useEffect, useState } from "react";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string | null;
  session: {
    title: string;
    track: { name: string };
    event: { title: string };
  };
}

export default function AttendeeResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my/resources");
      if (res.ok) {
        const json = await res.json();
        setResources(json.resources);
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
        <h1 className="text-2xl font-bold text-white">Resources</h1>
        <p className="text-muted">Materials from your enrolled sessions</p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">
            No resources available yet. Register for events to access their
            materials!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {r.session.title} · {r.session.event.title}
                </p>
              </div>
              <Badge variant="info">{r.session.track.name}</Badge>
              {r.type && (
                <span className="text-xs font-medium uppercase text-muted">
                  {r.type}
                </span>
              )}
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-muted hover:bg-surface hover:text-neon"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
