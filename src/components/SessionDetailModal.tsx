"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  Clock,
  MapPin,
  Users,
  Upload,
  FileText,
  Image as ImageIcon,
  Film,
  Trash2,
  ExternalLink,
  Loader2,
  Paperclip,
  BookOpen,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────── */
export interface SessionInfo {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  room?: string | null;
  maxAttendees?: number | null;
  instructor?: { id: string; name: string | null; email: string } | null;
  /** flattened instructor name for public pages */
  instructorName?: string | null;
  track?: { id: string; name: string; color?: string | null };
}

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: string; // "pdf" | "image" | "video" | "link"
  createdAt: string;
}

interface SessionDetailModalProps {
  session: SessionInfo;
  open: boolean;
  onClose: () => void;
  /** If true, show upload / delete controls */
  editable?: boolean;
  /** Track color for accent – hex or tailwind-safe */
  accentColor?: string;
}

/* ── Helpers ─────────────────────────────────────────── */
function fileTypeFromMime(mime: string): string {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "link";
}

function formatDuration(start: string, end: string) {
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert YouTube / Vimeo / Loom / Google Drive URLs to embeddable URLs */
function toEmbedUrl(url: string): string | null {
  try {
    // YouTube
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;

    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (driveMatch)
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    return null;
  } catch {
    return null;
  }
}

function isEmbeddableVideoUrl(url: string): boolean {
  return toEmbedUrl(url) !== null;
}

/* ═══════════════════════════════════════════════════════
   SESSION DETAIL MODAL — Bento Board Layout
   ═══════════════════════════════════════════════════════ */

export function SessionDetailModal({
  session,
  open,
  onClose,
  editable = false,
  accentColor,
}: SessionDetailModalProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const accent = accentColor || "#A3FF12";

  const fetchResources = useCallback(async () => {
    setLoadingResources(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/materials`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
      }
    } catch {
      /* ignore */
    }
    setLoadingResources(false);
  }, [session.id]);

  useEffect(() => {
    if (open) fetchResources();
  }, [open, fetchResources]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ── Upload handler ────────────────────────────────── */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload file
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        alert(err.error || "Upload failed");
        setUploading(false);
        return;
      }
      const { url } = await uploadRes.json();

      // 2. Create resource record
      const type = fileTypeFromMime(file.type);
      const title = file.name.replace(/\.[^.]+$/, ""); // strip extension
      const matRes = await fetch(`/api/sessions/${session.id}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type }),
      });
      if (matRes.ok) {
        await fetchResources();
      } else {
        const err = await matRes.json();
        alert(err.error || "Failed to save material");
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ── Add video/link handler ────────────────────────── */
  async function handleAddLink() {
    if (!linkUrl.trim()) return;
    setSavingLink(true);
    try {
      const isVideo = isEmbeddableVideoUrl(linkUrl.trim());
      const type = isVideo ? "video" : "link";
      const title = linkTitle.trim() || (isVideo ? "Video" : "Link");
      const res = await fetch(`/api/sessions/${session.id}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url: linkUrl.trim(), type }),
      });
      if (res.ok) {
        await fetchResources();
        setLinkUrl("");
        setLinkTitle("");
        setShowLinkForm(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save link");
      }
    } catch {
      alert("Failed to save link");
    }
    setSavingLink(false);
  }

  /* ── Delete handler ────────────────────────────────── */
  async function handleDelete(resourceId: string) {
    setDeleting(resourceId);
    try {
      const res = await fetch(`/api/sessions/${session.id}/materials`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
    } catch {
      /* ignore */
    }
    setDeleting(null);
  }

  if (!open) return null;

  const instructorName =
    session.instructorName ||
    session.instructor?.name ||
    session.instructor?.email ||
    null;

  const duration = formatDuration(session.startTime, session.endTime);
  const trackColor = session.track?.color || accent;

  const pdfs = resources.filter((r) => r.type === "pdf");
  const images = resources.filter((r) => r.type === "image");
  const videos = resources.filter((r) => r.type === "video");
  const others = resources.filter(
    (r) => !["pdf", "image", "video"].includes(r.type)
  );

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl shadow-black/40">
        {/* ── Header ──────────────────────────────────── */}
        <div className="sticky top-0 z-20 border-b border-surface-border bg-surface-card/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Track pill */}
              {session.track && (
                <span
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    borderColor: trackColor + "40",
                    backgroundColor: trackColor + "15",
                    color: trackColor,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: trackColor }}
                  />
                  {session.track.name}
                </span>
              )}
              <h2 className="text-xl font-bold text-white leading-tight">
                {session.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Bento Grid — Info Tiles ──────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Time */}
            <div className="rounded-xl border border-surface-border bg-surface/60 p-3.5">
              <Clock className="h-4 w-4 text-muted mb-1.5" />
              <p className="text-xs text-muted">Time</p>
              <p className="text-sm font-semibold text-white">
                {formatTime(session.startTime)} – {formatTime(session.endTime)}
              </p>
            </div>
            {/* Duration */}
            <div className="rounded-xl border border-surface-border bg-surface/60 p-3.5">
              <BookOpen className="h-4 w-4 text-muted mb-1.5" />
              <p className="text-xs text-muted">Duration</p>
              <p className="text-sm font-semibold text-white">{duration}</p>
            </div>
            {/* Room */}
            <div className="rounded-xl border border-surface-border bg-surface/60 p-3.5">
              <MapPin className="h-4 w-4 text-muted mb-1.5" />
              <p className="text-xs text-muted">Room</p>
              <p className="text-sm font-semibold text-white">
                {session.room || "TBA"}
              </p>
            </div>
            {/* Instructor */}
            <div className="rounded-xl border border-surface-border bg-surface/60 p-3.5">
              <Users className="h-4 w-4 text-muted mb-1.5" />
              <p className="text-xs text-muted">Instructor</p>
              <p className="text-sm font-semibold text-white truncate">
                {instructorName || "TBA"}
              </p>
            </div>
          </div>

          {/* ── Description ──────────────────────────── */}
          {session.description && (
            <div className="rounded-xl border border-surface-border bg-surface/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                About this Session
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {session.description}
              </p>
            </div>
          )}

          {/* ── Materials & Resources — Redesigned ──── */}
          <div className="rounded-xl border border-surface-border bg-surface/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: accent + "20" }}
                >
                  <Paperclip className="h-4 w-4" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Materials & Resources</h3>
                  <p className="text-[11px] text-muted">
                    {resources.length === 0
                      ? "No materials added yet"
                      : `${resources.length} item${resources.length !== 1 ? "s" : ""} available`}
                  </p>
                </div>
              </div>
              {editable && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowLinkForm((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                  >
                    <Film className="h-3 w-3" />
                    Link
                  </button>
                  <label className="cursor-pointer">
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                      {uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      File
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Link / Video URL form */}
            {editable && showLinkForm && (
              <div className="border-b border-surface-border bg-purple-500/5 px-5 py-4 space-y-2.5">
                <p className="text-xs font-semibold text-purple-400">
                  Add a video or link
                </p>
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddLink}
                    disabled={savingLink || !linkUrl.trim()}
                    className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
                  >
                    {savingLink ? "Saving…" : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowLinkForm(false);
                      setLinkUrl("");
                      setLinkTitle("");
                    }}
                    className="rounded-lg px-4 py-1.5 text-xs font-medium text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Bento Grid Content */}
            <div className="p-3">
              {loadingResources ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted" />
                </div>
              ) : resources.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="mt-2.5 text-sm text-muted">No materials yet</p>
                  {editable && (
                    <p className="mt-1 text-xs text-gray-600">
                      Add videos, PDFs, or other resources for attendees
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {/* ─── Videos — span full width ─── */}
                  {videos.map((r) => {
                    const embedUrl = toEmbedUrl(r.url);
                    return (
                      <div
                        key={r.id}
                        className="col-span-4 rounded-xl border border-purple-500/15 bg-purple-500/5 overflow-hidden"
                      >
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={r.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full aspect-video"
                          />
                        ) : (
                          <video
                            src={r.url}
                            controls
                            className="w-full aspect-video bg-black"
                          />
                        )}
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Film className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            <span className="text-xs font-medium text-white truncate">
                              {r.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted hover:text-white hover:bg-surface-elevated transition-colors">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {editable && (
                              <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="rounded-md p-1 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                {deleting === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* ─── Images — bento sizing ─── */}
                  {images.map((r, i) => {
                    // First image or solo image spans 4 cols, pairs split 2+2, triplets do 2+1+1
                    const span =
                      images.length === 1
                        ? "col-span-4"
                        : images.length === 2
                        ? "col-span-2"
                        : i === 0
                        ? "col-span-2 row-span-2"
                        : "col-span-2";
                    return (
                      <div
                        key={r.id}
                        className={`group relative rounded-xl border border-blue-500/15 overflow-hidden ${span}`}
                      >
                        <div className="relative h-full min-h-[120px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.url}
                            alt={r.title}
                            className="h-full w-full object-cover"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className="text-xs font-medium text-white truncate">{r.title}</span>
                            <div className="mt-1 flex items-center gap-1">
                              <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-white/70 hover:text-white transition-colors">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              {editable && (
                                <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="rounded-md p-1 text-white/70 hover:text-red-400 transition-colors">
                                  {deleting === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Type badge */}
                          <div className="absolute top-2 left-2 rounded-md bg-blue-500/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur-sm">
                            IMG
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* ─── PDFs — compact bento tiles ─── */}
                  {pdfs.map((r) => (
                    <div
                      key={r.id}
                      className="col-span-2 group rounded-xl border border-red-500/12 bg-gradient-to-br from-red-500/8 to-red-500/3 p-3.5 flex flex-col justify-between min-h-[100px] hover:border-red-500/25 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
                          <FileText className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted hover:text-white transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {editable && (
                            <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="rounded-md p-1 text-muted hover:text-red-400 transition-colors">
                              {deleting === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-white truncate">{r.title}</p>
                        <p className="text-[10px] text-red-400/70 font-medium uppercase mt-0.5">PDF Document</p>
                      </div>
                    </div>
                  ))}

                  {/* ─── Links — compact bento tiles ─── */}
                  {others.map((r) => (
                    <div
                      key={r.id}
                      className="col-span-2 group rounded-xl border border-surface-border bg-gradient-to-br from-surface-elevated/60 to-surface/40 p-3.5 flex flex-col justify-between min-h-[100px] hover:border-surface-border/80 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                          <ExternalLink className="h-4 w-4 text-muted" />
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted hover:text-white transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {editable && (
                            <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="rounded-md p-1 text-muted hover:text-red-400 transition-colors">
                              {deleting === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-white truncate">{r.title}</p>
                        <p className="text-[10px] text-muted truncate mt-0.5">{r.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
