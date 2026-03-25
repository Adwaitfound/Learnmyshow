"use client";import { useEffect, useState, useCallback, useRef } from "react";import {  PlusCircle,  Calendar,  Users,  FileText,  ChevronRight,  ChevronLeft,  CheckCircle2,  Settings,  Loader2,  Trash2,  X,  Layers,  Clock,  MapPin,  DollarSign,  Send,  Upload,  Repeat,} from "lucide-react";import { Button } from "@/components/ui/Button";import { Badge } from "@/components/ui/Badge";import { SessionDetailModal, SessionInfo } from "@/components/SessionDetailModal";/* ── Types ───────────────────────────────────────────────── */interface EventSummary {  id: string;  title: string;  slug: string;  startDate: string;  endDate: string;  status: string;  capacity: number | null;  price: string | null;  bookingCount: number;  trackCount: number;  revenue: number;}interface Track {  id: string;  name: string;  description: string | null;  color: string | null;  _count: { sessions: number };  sessions: SessionRecord[];}interface SessionRecord {  id: string;  title: string;  description: string | null;  startTime: string;  endTime: string;  room: string | null;  maxAttendees: number | null;  instructor: { id: string; name: string | null; email: string } | null;  track: { id: string; name: string };}interface FullEvent {  id: string;  title: string;  slug: string;  description: string | null;  startDate: string;  endDate: string;  venue: string | null;  city: string | null;  state: string | null;  capacity: number | null;  price: string | null;  status: string;  coverImage: string | null;  recurring: boolean;  tracks: Track[];  occurrences: OccurrenceRecord[];  _count: { bookings: number };  revenue: number;  confirmedBookings: number;}interface OccurrenceRecord {  id: string;  label: string;  startDate: string;  endDate: string;  order: number;}const WIZARD_STEPS = [  { step: 1, label: "Event Details", description: "Name, date, venue", icon: FileText },  { step: 2, label: "Tracks & Sessions", description: "Build your agenda", icon: Calendar },  { step: 3, label: "Speakers", description: "Assign instructors", icon: Users },  { step: 4, label: "Pricing", description: "Tickets & capacity", icon: Settings },  { step: 5, label: "Review & Publish", description: "Request approval", icon: CheckCircle2 },];/* ══════════════════════════════════════════════════════════ */export default function OrganizerDashboardPage() {  const [events, setEvents] = useState<EventSummary[]>([]);  const [loading, setLoading] = useState(true);  const [editingEvent, setEditingEvent] = useState<FullEvent | null>(null);  const [wizardStep, setWizardStep] = useState(1);  const [showNewForm, setShowNewForm] = useState(false);  const fetchEvents = useCallback(async () => {    setLoading(true);    const res = await fetch("/api/events");    if (res.ok) {      const data = await res.json();      setEvents(data.events);    }    setLoading(false);  }, []);  useEffect(() => {    fetchEvents();  }, [fetchEvents]);  async function openEvent(eventId: string) {    const res = await fetch(`/api/events/${eventId}`);    if (res.ok) {      const data = await res.json();      setEditingEvent(data.event);      setWizardStep(1);    }  }  function closeEditor() {    setEditingEvent(null);    setWizardStep(1);    fetchEvents();  }  /* ── If editing, show the wizard ─────────────────────── */  if (editingEvent) {    return (      <EventWizard        event={editingEvent}        step={wizardStep}        setStep={setWizardStep}        onClose={closeEditor}        onRefresh={async () => {          const res = await fetch(`/api/events/${editingEvent.id}`);          if (res.ok) {            const data = await res.json();            setEditingEvent(data.event);          }        }}      />    );  }  /* ── Main list view ─────────────────────────────────── */  return (    <div className="space-y-8">      <div className="flex items-start justify-between">        <div>          <h1 className="text-2xl font-bold text-white">Event Builder</h1>          <p className="text-muted">Create and manage your events</p>        </div>        <Button onClick={() => setShowNewForm(true)}>          <PlusCircle className="mr-2 h-4 w-4" /> New Event        </Button>      </div>      {/* Quick-Create Modal */}
      {showNewForm && (
        <NewEventModal
          onClose={() => setShowNewForm(false)}
          onCreated={(id) => {
            setShowNewForm(false);
            openEvent(id);
          }}
        />
      )}

      {/* Wizard guide */}
      <div className="rounded-2xl border border-neon/20 bg-neon/10 p-6">
        <h2 className="font-semibold text-white">Event Builder Wizard</h2>
        <p className="mt-1 text-sm text-muted">
          Follow these steps to create a new event
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.step} className="flex flex-1 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-surface-border bg-surface-card text-sm font-semibold text-muted">
                {step.step}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">{step.label}</p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-gray-300 sm:block" />
              )}
            </div>
          ))}
        </div>
        <Button className="mt-5" onClick={() => setShowNewForm(true)}>
          Start Building <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* My Events */}
      <div>
        <h2 className="mb-4 font-semibold text-white">My Events</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-muted">No events yet — create your first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-5 rounded-xl border border-surface-border bg-surface-card p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-white">
                      {event.title}
                    </h3>
                    <Badge
                      variant={
                        event.status === "PUBLISHED"
                          ? "success"
                          : event.status === "CANCELLED"
                          ? "error"
                          : event.status === "PENDING_REVIEW"
                          ? "info"
                          : "warning"
                      }
                    >
                      {event.status === "PENDING_REVIEW" ? "PENDING REVIEW" : event.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.startDate !== event.endDate &&
                        `–${new Date(event.endDate).toLocaleDateString()}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {event.bookingCount}
                      {event.capacity ? ` / ${event.capacity}` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" /> {event.trackCount} track
                      {event.trackCount !== 1 && "s"}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-white">
                    ₹{event.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted">Revenue</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEvent(event.id)}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NewEventModal — quick inline creation
   ═══════════════════════════════════════════════════════════ */
function NewEventModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const payload: Record<string, unknown> = {
      title: fd.get("title"),
      description: fd.get("description"),
      venue: fd.get("venue"),
      city: fd.get("city"),
      state: fd.get("state"),
      recurring: isRecurring,
    };

    if (!isRecurring) {
      payload.startDate = fd.get("startDate");
      payload.endDate = fd.get("endDate");
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      onCreated(data.event.id);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-surface-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Create New Event</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface-elevated">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title *</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            />
          </div>
          {/* ── Recurring toggle ── */}
          <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated px-4 py-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Recurring / Series Event</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isRecurring ? "bg-purple-500" : "bg-surface-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isRecurring ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isRecurring && (
            <p className="text-xs text-purple-300 -mt-2">
              Dates will be configured as occurrences in the next step.
            </p>
          )}

          {!isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Start Date *</label>
              <input
                name="startDate"
                type="datetime-local"
                required
                className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">End Date *</label>
              <input
                name="endDate"
                type="datetime-local"
                required
                className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Venue</label>
              <input name="venue" className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">City</label>
              <input name="city" className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">State</label>
              <input name="state" className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EventWizard — 5-step full editor
   ═══════════════════════════════════════════════════════════ */
function EventWizard({
  event,
  step,
  setStep,
  onClose,
  onRefresh,
}: {
  event: FullEvent;
  step: number;
  setStep: (s: number) => void;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onClose}
            className="mb-1 flex items-center gap-1 text-sm text-muted hover:text-neon"
          >
            <ChevronLeft className="h-4 w-4" /> Back to My Events
          </button>
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant={
                event.status === "PUBLISHED"
                  ? "success"
                  : event.status === "CANCELLED"
                  ? "error"
                  : event.status === "PENDING_REVIEW"
                  ? "info"
                  : "warning"
              }
            >
              {event.status === "PENDING_REVIEW" ? "PENDING REVIEW" : event.status}
            </Badge>
            <span className="text-sm text-muted">{event.slug}</span>
          </div>
        </div>
      </div>

      {/* Step navigation */}
      <div className="flex gap-1 rounded-xl border border-surface-border bg-surface-card p-2">
        {WIZARD_STEPS.map((s) => (
          <button
            key={s.step}
            onClick={() => setStep(s.step)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              step === s.step
                ? "bg-neon text-black"
                : "text-muted hover:bg-surface-elevated"
            }`}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && <StepEventDetails event={event} onRefresh={onRefresh} />}
      {step === 2 && <StepTracksAndSessions event={event} onRefresh={onRefresh} />}
      {step === 3 && <StepSpeakers event={event} onRefresh={onRefresh} />}
      {step === 4 && <StepPricing event={event} onRefresh={onRefresh} />}
      {step === 5 && <StepPublish event={event} onRefresh={onRefresh} onClose={onClose} />}

      {/* Step nav buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={step <= 1}
          onClick={() => setStep(step - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {step < 5 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Step 1 — Event Details
   ═══════════════════════════════════════════════════════════ */
function StepEventDetails({
  event,
  onRefresh,
}: {
  event: FullEvent;
  onRefresh: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(event.coverImage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecurring, setIsRecurring] = useState(event.recurring || false);
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>(event.occurrences || []);
  const [generatingOccs, setGeneratingOccs] = useState(false);
  const [showPatternForm, setShowPatternForm] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [occError, setOccError] = useState<string | null>(null);
  const [occSuccess, setOccSuccess] = useState<string | null>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setCoverImage(url);
        await fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImage: url }),
        });
        await onRefresh();
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    setCoverImage(null);
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImage: null }),
    });
    await onRefresh();
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      title: fd.get("title"),
      description: fd.get("description"),
      venue: fd.get("venue"),
      city: fd.get("city"),
      state: fd.get("state"),
      recurring: isRecurring,
    };
    // Only send dates if not recurring (recurring auto-computes them)
    if (!isRecurring) {
      payload.startDate = fd.get("startDate");
      payload.endDate = fd.get("endDate");
    }
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await onRefresh();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function handleToggleRecurring() {
    const newVal = !isRecurring;
    setIsRecurring(newVal);
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurring: newVal }),
    });
    await onRefresh();
  }

  async function handleGeneratePattern(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneratingOccs(true);
    setOccError(null);
    setOccSuccess(null);
    try {
      const fd = new FormData(e.currentTarget);
      const pattern = {
        type: fd.get("patternType") as string,
        startMonth: fd.get("startMonth") as string,
        months: parseInt(fd.get("months") as string) || 12,
        weekendOrdinal: parseInt(fd.get("weekendOrdinal") as string) || 1,
        dayOfWeek: parseInt(fd.get("dayOfWeek") as string) || 6,
        durationDays: parseInt(fd.get("durationDays") as string) || 2,
        dayOfMonth: parseInt(fd.get("dayOfMonth") as string) || 1,
      };
      console.log("[Generate Pattern] event.id:", event.id, "pattern:", pattern);
      const res = await fetch(`/api/events/${event.id}/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
      });
      const data = await res.json();
      console.log("[Generate Pattern] response:", res.status, data);
      if (res.ok) {
        setOccurrences(data.occurrences);
        setShowPatternForm(false);
        setOccSuccess(`Generated ${data.occurrences.length} dates!`);
        setTimeout(() => setOccSuccess(null), 3000);
        await onRefresh();
      } else {
        setOccError(data.error || `Failed to generate (${res.status})`);
      }
    } catch (err) {
      console.error("[Generate Pattern] error:", err);
      setOccError(err instanceof Error ? err.message : "Network error — check your connection");
    }
    setGeneratingOccs(false);
  }

  async function handleAddManualOccurrence(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOccError(null);
    setOccSuccess(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch(`/api/events/${event.id}/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: fd.get("label"),
          startDate: fd.get("occStartDate"),
          endDate: fd.get("occEndDate"),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOccurrences((prev) => [...prev, data.occurrence]);
        setShowManualAdd(false);
        setOccSuccess("Date added!");
        setTimeout(() => setOccSuccess(null), 3000);
        await onRefresh();
      } else {
        setOccError(data.error || `Failed to add (${res.status})`);
      }
    } catch (err) {
      console.error("[Manual Add] error:", err);
      setOccError(err instanceof Error ? err.message : "Network error");
    }
  }

  async function handleDeleteOccurrence(occId: string) {
    await fetch(`/api/events/${event.id}/occurrences?occurrenceId=${occId}`, {
      method: "DELETE",
    });
    setOccurrences((prev) => prev.filter((o) => o.id !== occId));
    await onRefresh();
  }

  const inputCls = "mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Event Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input name="title" defaultValue={event.title} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" defaultValue={event.description || ""} rows={4} className={inputCls} />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image / Banner</label>
            {coverImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-surface-border">
                <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-surface-elevated px-3 py-2 text-sm font-medium text-white hover:bg-surface-border transition-colors">Replace</button>
                  <button type="button" onClick={handleRemoveImage} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">Remove</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; if (file) handleImageUpload(file); }}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border bg-surface-elevated/50 py-12 hover:border-neon/40 hover:bg-surface-elevated transition-all"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-neon" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-300">Click to upload or drag & drop</p>
                      <p className="mt-1 text-xs text-muted">JPEG, PNG, WebP, GIF • Max 5MB</p>
                    </div>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
          </div>

          {/* ── Recurring toggle ───────────────────────── */}
          <div className="rounded-lg border border-surface-border bg-surface/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Recurring / Series Event</p>
                  <p className="text-xs text-muted">
                    An event that happens multiple times (e.g. monthly, biweekly)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleRecurring}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRecurring ? "bg-neon" : "bg-surface-elevated"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRecurring ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ── Date inputs (only for non-recurring) ──── */}
          {!isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Start Date</label>
                <input name="startDate" type="datetime-local" defaultValue={event.startDate?.slice(0, 16)} required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">End Date</label>
                <input name="endDate" type="datetime-local" defaultValue={event.endDate?.slice(0, 16)} required className={inputCls} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Venue</label>
              <input name="venue" defaultValue={event.venue || ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">City</label>
              <input name="city" defaultValue={event.city || ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">State</label>
              <input name="state" defaultValue={event.state || ""} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Details"}
            </Button>
            {success && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ══ Occurrences Manager (only for recurring) ══ */}
      {isRecurring && (
        <div className="rounded-xl border border-purple-500/20 bg-surface-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Event Occurrences</h2>
              <span className="text-xs text-muted">({occurrences.length} dates)</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setShowPatternForm(!showPatternForm); setShowManualAdd(false); }}>
                <Repeat className="mr-1.5 h-3.5 w-3.5" /> Generate Pattern
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowManualAdd(!showManualAdd); setShowPatternForm(false); }}>
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Date
              </Button>
            </div>
          </div>

          {/* ── Error / Success banners ───────────────── */}
          {occError && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2">
              <p className="text-sm text-red-300">{occError}</p>
              <button onClick={() => setOccError(null)} className="text-red-400 hover:text-red-200"><X className="h-4 w-4" /></button>
            </div>
          )}
          {occSuccess && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2">
              <p className="text-sm text-green-300">{occSuccess}</p>
              <button onClick={() => setOccSuccess(null)} className="text-green-400 hover:text-green-200"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* ── Pattern Generator ─────────────────────── */}
          {showPatternForm && (
            <form onSubmit={handleGeneratePattern} className="mb-5 rounded-lg border border-purple-500/20 bg-surface p-4 space-y-3">
              <p className="text-sm font-medium text-purple-300">Generate dates from a pattern</p>
              <p className="text-xs text-muted">This will replace all existing occurrences</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Pattern Type</label>
                  <select name="patternType" defaultValue="monthly_weekend" className={inputCls}>
                    <option value="monthly_weekend">Monthly (Nth weekend)</option>
                    <option value="monthly_date">Monthly (fixed date)</option>
                    <option value="biweekly">Biweekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Starting Month</label>
                  <input name="startMonth" type="month" defaultValue={new Date().toISOString().slice(0, 7)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">How Many Months</label>
                  <input name="months" type="number" min={1} max={24} defaultValue={12} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Duration (days)</label>
                  <input name="durationDays" type="number" min={1} max={7} defaultValue={2} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Which Weekend</label>
                  <select name="weekendOrdinal" defaultValue="2" className={inputCls}>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Day of Week</label>
                  <select name="dayOfWeek" defaultValue="6" className={inputCls}>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Day of Month</label>
                  <input name="dayOfMonth" type="number" min={1} max={28} defaultValue={15} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={generatingOccs}>
                  {generatingOccs ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</> : "Generate Dates"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPatternForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {/* ── Manual Add ────────────────────────────── */}
          {showManualAdd && (
            <form onSubmit={handleAddManualOccurrence} className="mb-5 rounded-lg border border-surface-border bg-surface p-4 space-y-3">
              <p className="text-sm font-medium text-gray-300">Add a single occurrence</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Label</label>
                  <input name="label" placeholder="e.g. January Edition" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Start Date</label>
                  <input name="occStartDate" type="datetime-local" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">End Date</label>
                  <input name="occEndDate" type="datetime-local" required className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Add Occurrence</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowManualAdd(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {/* ── Occurrences List ──────────────────────── */}
          {occurrences.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface/40 py-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-2 text-sm text-muted">No dates added yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Use &quot;Generate Pattern&quot; or &quot;Add Date&quot; to set up your recurring schedule
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {occurrences
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((occ, idx) => {
                  const start = new Date(occ.startDate);
                  const end = new Date(occ.endDate);
                  const isSameDay = start.toDateString() === end.toDateString();
                  const dateStr = isSameDay
                    ? start.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" })
                    : `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`;

                  return (
                    <div
                      key={occ.id}
                      className="flex items-center gap-4 rounded-lg border border-surface-border bg-surface/60 px-4 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-xs font-bold text-purple-400">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{occ.label}</p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {dateStr}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteOccurrence(occ.id)}
                        className="rounded-md p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */
function getEventDays(startDate: string, endDate: string) {
  const days: Date[] = [];
  const s = new Date(startDate);
  const e = new Date(endDate);
  const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  if (days.length === 0) days.push(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
  return days;
}

function toDateKey(d: string | Date) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function dayLabel(date: Date, idx: number) {
  return `Day ${idx + 1} — ${date.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}`;
}

/* ═══════════════════════════════════════════════════════════
   Step 2 — Tracks & Sessions (Day-wise)
   ═══════════════════════════════════════════════════════════ */
function StepTracksAndSessions({
  event,
  onRefresh,
}: {
  event: FullEvent;
  onRefresh: () => Promise<void>;
}) {
  const isRecurring = event.recurring && event.occurrences.length > 0;
  const sortedOccurrences = isRecurring
    ? [...event.occurrences].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    : [];
  const [selectedOccIdx, setSelectedOccIdx] = useState(0);

  // Compute the effective date range for day tabs
  const effectiveStart = isRecurring
    ? sortedOccurrences[selectedOccIdx]?.startDate ?? event.startDate
    : event.startDate;
  const effectiveEnd = isRecurring
    ? sortedOccurrences[selectedOccIdx]?.endDate ?? event.endDate
    : event.endDate;

  const eventDays = getEventDays(effectiveStart, effectiveEnd);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const safeDayIdx = selectedDayIdx < eventDays.length ? selectedDayIdx : 0;
  const selectedDayKey = toDateKey(eventDays[safeDayIdx]);

  const [showAddTrack, setShowAddTrack] = useState(false);
  const [addingTrack, setAddingTrack] = useState(false);
  const [showAddSession, setShowAddSession] = useState<string | null>(null);
  const [addingSession, setAddingSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);

  async function handleAddTrack(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddingTrack(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/events/${event.id}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description"),
        color: fd.get("color"),
      }),
    });
    await onRefresh();
    setAddingTrack(false);
    setShowAddTrack(false);
  }

  async function handleDeleteTrack(trackId: string) {
    if (!confirm("Delete this track and all its sessions?")) return;
    await fetch(`/api/events/${event.id}/tracks?trackId=${trackId}`, {
      method: "DELETE",
    });
    await onRefresh();
  }

  async function handleAddSession(e: React.FormEvent<HTMLFormElement>, trackId: string) {
    e.preventDefault();
    setAddingSession(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/events/${event.id}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        startTime: fd.get("startTime"),
        endTime: fd.get("endTime"),
        room: fd.get("room"),
        trackId,
      }),
    });
    await onRefresh();
    setAddingSession(false);
    setShowAddSession(null);
  }

  async function handleDeleteSession(sessionId: string) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/events/${event.id}/sessions?sessionId=${sessionId}`, {
      method: "DELETE",
    });
    await onRefresh();
  }

  const TRACK_COLORS = [
    { hex: "#3B82F6", name: "Blue" },
    { hex: "#10B981", name: "Green" },
    { hex: "#F59E0B", name: "Amber" },
    { hex: "#EF4444", name: "Red" },
    { hex: "#8B5CF6", name: "Purple" },
    { hex: "#EC4899", name: "Pink" },
  ];

  // Build per-day session counts for the day tabs
  const allSessions = event.tracks.flatMap((t) => t.sessions);
  const sessionsPerDay: Record<string, number> = {};
  allSessions.forEach((s) => {
    const dk = toDateKey(s.startTime);
    sessionsPerDay[dk] = (sessionsPerDay[dk] || 0) + 1;
  });

  // Default start/end time for the "add session" form to match the selected day
  const selectedDate = eventDays[safeDayIdx];
  const defaultStart = `${toDateKey(selectedDate)}T09:00`;
  const defaultEnd = `${toDateKey(selectedDate)}T10:00`;

  return (
  <>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Tracks & Sessions
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Tracks are parallel streams at your event (e.g. &quot;Keynote&quot;, &quot;AI Workshop&quot;, &quot;Networking&quot;). Add sessions to each track for each day.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddTrack(true)}>
          <PlusCircle className="mr-1 h-4 w-4" /> Add Track
        </Button>
      </div>

      {/* Occurrence tabs (recurring events only) */}
      {isRecurring && sortedOccurrences.length > 0 && (
        <div className="rounded-xl border border-purple-500/20 bg-surface-card p-2">
          <p className="px-2 pb-1.5 text-xs font-medium text-purple-300 flex items-center gap-1">
            <Repeat className="h-3 w-3" /> Occurrences
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {sortedOccurrences.map((occ, idx) => {
              const start = new Date(occ.startDate);
              return (
                <button
                  key={occ.id}
                  onClick={() => { setSelectedOccIdx(idx); setSelectedDayIdx(0); }}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    idx === selectedOccIdx
                      ? "bg-purple-500 text-white"
                      : "text-muted hover:bg-surface-elevated"
                  }`}
                >
                  <span className="text-xs font-bold">{occ.label}</span>
                  <span className={`text-[10px] ${idx === selectedOccIdx ? "text-white/70" : "text-muted"}`}>
                    {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day tabs */}
      {eventDays.length > 1 && (
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-surface-border bg-surface-card p-2">
          {eventDays.map((day, idx) => {
            const dk = toDateKey(day);
            const count = sessionsPerDay[dk] || 0;
            return (
              <button
                key={dk}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  idx === safeDayIdx
                    ? "bg-neon text-black"
                    : "text-muted hover:bg-surface-elevated"
                }`}
              >
                <span className="text-xs font-bold">Day {idx + 1}</span>
                <span className={`text-xs ${idx === safeDayIdx ? "text-black/70" : "text-muted"}`}>
                  {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className={`mt-0.5 text-[10px] ${idx === safeDayIdx ? "text-black/60" : "text-muted"}`}>
                  {count} session{count !== 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected day header — always visible */}
      <div className="rounded-lg bg-surface-elevated/60 border border-surface-border px-4 py-2.5">
        <p className="text-sm font-semibold text-neon">
          {dayLabel(selectedDate, safeDayIdx)}
        </p>
        <p className="text-xs text-muted">
          {sessionsPerDay[selectedDayKey] || 0} session(s) across all tracks on this day
        </p>
      </div>

      {/* Add Track Form */}
      {showAddTrack && (
        <form
          onSubmit={handleAddTrack}
          className="rounded-xl border border-neon/20 bg-neon/10 p-4 space-y-3"
        >
          <p className="text-xs font-medium text-neon">New Track</p>
          <input
            name="name"
            placeholder="Track name (e.g. Keynote, AI & ML, Workshops)"
            required
            className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
          />
          <input
            name="description"
            placeholder="Track description (optional)"
            className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
          />
          <div>
            <label className="block text-xs text-muted mb-1.5">Track Color</label>
            <div className="flex gap-2">
              {TRACK_COLORS.map((c, i) => (
                <label key={c.hex} className="cursor-pointer" title={c.name}>
                  <input
                    type="radio"
                    name="color"
                    value={c.hex}
                    defaultChecked={i === 0}
                    className="peer sr-only"
                  />
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-transparent transition-all peer-checked:border-white peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-neon"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="sr-only">{c.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={addingTrack}>
              {addingTrack ? "Adding..." : "Add Track"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddTrack(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Tracks — filtered by selected day */}
      {event.tracks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-muted">No tracks yet</p>
          <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
            Create tracks like &quot;Keynote&quot;, &quot;Workshops&quot;, or &quot;Panels&quot; — then add sessions to each track for each day of your event.
          </p>
          <Button size="sm" className="mt-4" onClick={() => setShowAddTrack(true)}>
            <PlusCircle className="mr-1 h-4 w-4" /> Create Your First Track
          </Button>
        </div>
      ) : (
        event.tracks.map((track) => {
          const daySessions = track.sessions.filter(
            (s) => toDateKey(s.startTime) === selectedDayKey
          );

          return (
            <div
              key={track.id}
              className="rounded-xl border border-surface-border bg-surface-card overflow-hidden"
            >
              {/* Track header */}
              <div className="flex items-center justify-between border-b border-surface-elevated px-5 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: track.color || "#6B7280" }}
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      <span className="text-muted font-normal">Track:</span> {track.name}
                    </h3>
                    <span className="text-xs text-muted">
                      {daySessions.length} session{daySessions.length !== 1 && "s"} on this day
                      {track.sessions.length !== daySessions.length && (
                        <span className="ml-1 text-gray-300">
                          · {track.sessions.length} total
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowAddSession(showAddSession === track.id ? null : track.id)
                    }
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-neon" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrack(track.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>

              {/* Add Session Form — pre-filled with selected day */}
              {showAddSession === track.id && (
                <form
                  onSubmit={(e) => handleAddSession(e, track.id)}
                  className="border-b border-surface-elevated bg-surface p-4 space-y-3"
                >
                  <p className="text-xs font-medium text-muted">
                    Adding session for {dayLabel(selectedDate, safeDayIdx)}
                  </p>
                  <input
                    name="title"
                    placeholder="Session title"
                    required
                    className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                  <input
                    name="description"
                    placeholder="Session description (optional)"
                    className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1">Start Time</label>
                      <input
                        name="startTime"
                        type="datetime-local"
                        defaultValue={defaultStart}
                        required
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">End Time</label>
                      <input
                        name="endTime"
                        type="datetime-local"
                        defaultValue={defaultEnd}
                        required
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Room</label>
                      <input
                        name="room"
                        placeholder="Room"
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={addingSession}>
                      {addingSession ? "Adding..." : "Add Session"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSession(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Sessions list — only for selected day */}
              {daySessions.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">
                  No sessions on this day — click + to add one
                </p>
              ) : (
                <div className="divide-y divide-surface-border">
                  {daySessions
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-surface cursor-pointer transition-colors"
                      onClick={() =>
                        setSelectedSession({
                          id: s.id,
                          title: s.title,
                          description: s.description,
                          startTime: s.startTime,
                          endTime: s.endTime,
                          room: s.room,
                          maxAttendees: s.maxAttendees,
                          instructor: s.instructor,
                          track: { id: track.id, name: track.name, color: track.color ?? undefined },
                        })
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {s.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(s.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            –
                            {new Date(s.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {s.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {s.room}
                            </span>
                          )}
                          {s.instructor && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{" "}
                              {s.instructor.name || s.instructor.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>

    {/* Session Detail Modal */}
    {selectedSession && (
      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        editable
        accentColor={selectedSession.track?.color || "#A3FF12"}
      />
    )}
  </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Step 3 — Speakers / Instructors
   ═══════════════════════════════════════════════════════════ */
function StepSpeakers({
  event,
  onRefresh,
}: {
  event: FullEvent;
  onRefresh: () => Promise<void>;
}) {
  const allSessions = event.tracks.flatMap((t) =>
    t.sessions.map((s) => ({ ...s, trackName: t.name }))
  );

  const [editing, setEditing] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastInvited, setLastInvited] = useState<string | null>(null);

  async function handleAssign(sessionId: string) {
    setSaving(true);
    const res = await fetch(`/api/events/${event.id}/sessions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, instructorEmail: email }),
    });
    const result = await res.json();
    if (result.session?.inviteSent) {
      setLastInvited(email);
      setTimeout(() => setLastInvited(null), 5000);
    }
    await onRefresh();
    setSaving(false);
    setEditing(null);
    setEmail("");
  }

  async function handleRemove(sessionId: string) {
    await fetch(`/api/events/${event.id}/sessions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, instructorEmail: "" }),
    });
    await onRefresh();
  }

  if (allSessions.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
        <Users className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-muted">
          Add tracks & sessions first (Step 2), then assign speakers here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        Assign Speakers to Sessions
      </h2>
      <p className="text-sm text-muted">
        Enter any email address to assign a speaker. If they don&apos;t have an
        account yet, we&apos;ll send them an invite to register.
      </p>

      {lastInvited && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
          <Send className="h-4 w-4 shrink-0" />
          <span>
            Invite sent to <strong>{lastInvited}</strong> — they&apos;ll get an email to register and access their session.
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">
                Session
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">
                Track
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">
                Speaker
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-elevated">
            {allSessions.map((s) => (
              <tr key={s.id} className="hover:bg-surface">
                <td className="px-5 py-3 text-sm text-white">{s.title}</td>
                <td className="px-5 py-3">
                  <Badge variant="info">{s.trackName}</Badge>
                </td>
                <td className="px-5 py-3">
                  {editing === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        placeholder="instructor@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-2 py-1 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                      />
                      <Button
                        size="sm"
                        disabled={saving || !email}
                        onClick={() => handleAssign(s.id)}
                      >
                        {saving ? "..." : "Assign"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(null);
                          setEmail("");
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : s.instructor ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neon/15 text-xs font-bold text-neon">
                        {(s.instructor.name?.[0] || s.instructor.email[0]).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-300">
                        {s.instructor.name || s.instructor.email}
                      </span>
                      <button
                        onClick={() => handleRemove(s.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {editing !== s.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(s.id);
                        setEmail(s.instructor?.email || "");
                      }}
                    >
                      <Users className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Step 4 — Pricing & Capacity
   ═══════════════════════════════════════════════════════════ */
function StepPricing({
  event,
  onRefresh,
}: {
  event: FullEvent;
  onRefresh: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: fd.get("price"),
        capacity: fd.get("capacity"),
      }),
    });
    await onRefresh();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Pricing & Capacity
      </h2>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Ticket Price (₹)
            </label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={event.price || ""}
                placeholder="0 = Free"
                className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 py-2 pl-10 pr-4 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Leave empty or 0 for a free event
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Maximum Capacity
            </label>
            <div className="relative mt-1">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="capacity"
                type="number"
                min="1"
                defaultValue={event.capacity || ""}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 py-2 pl-10 pr-4 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Leave empty for unlimited
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-surface p-4">
          <p className="text-sm text-muted">
            <strong>Current:</strong>{" "}
            {event.price ? `₹${parseFloat(event.price).toLocaleString()}` : "Free"} per ticket
            {event.capacity ? ` · ${event.capacity} seats` : " · Unlimited seats"}
          </p>
          <p className="text-sm text-muted">
            <strong>Bookings so far:</strong> {event.confirmedBookings} confirmed · Revenue ₹
            {event.revenue.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Pricing"}
          </Button>
          {success && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Step 5 — Review & Publish (organizers request, admins publish)
   ═══════════════════════════════════════════════════════════ */
function StepPublish({
  event,
  onRefresh,
  onClose,
}: {
  event: FullEvent;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const totalSessions = event.tracks.reduce((s, t) => s + t.sessions.length, 0);
  const assignedSpeakers = event.tracks.reduce(
    (s, t) => s + t.sessions.filter((ss) => ss.instructor).length,
    0
  );

  const checks = [
    { label: "Event details filled", pass: !!event.title && !!event.startDate },
    { label: "At least one track", pass: event.tracks.length > 0 },
    { label: "At least one session", pass: totalSessions > 0 },
    {
      label: "All sessions have speakers",
      pass: totalSessions > 0 && assignedSpeakers === totalSessions,
      warn: true,
    },
    { label: "Pricing set", pass: event.price !== null, warn: true },
  ];

  const requiredPassed = checks.filter((c) => !c.warn).every((c) => c.pass);

  async function handleRequestReview() {
    if (!confirm("Submit this event for admin review? The admin will approve and publish it.")) return;
    setSubmitting(true);
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PENDING_REVIEW" }),
    });
    await onRefresh();
    setSubmitting(false);
  }

  async function handleWithdraw() {
    if (!confirm("Withdraw this review request and move back to draft?")) return;
    await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DRAFT" }),
    });
    await onRefresh();
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this event and all its data?")) return;
    await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    onClose();
  }

  const isPending = event.status === "PENDING_REVIEW";
  const isPublished = event.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isPending && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="font-semibold text-blue-300">Pending Admin Review</p>
              <p className="text-sm text-blue-400">
                Your event has been submitted for review. A super admin will approve and publish it.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPublished && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-semibold text-green-300">Event Published</p>
              <p className="text-sm text-green-400">
                Your event is live and visible to attendees.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Pre-Review Checklist
        </h2>
        <div className="space-y-3">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              {c.pass ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : c.warn ? (
                <div className="h-5 w-5 rounded-full border-2 border-yellow-400" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-red-400" />
              )}
              <span
                className={`text-sm ${
                  c.pass
                    ? "text-gray-300"
                    : c.warn
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">Summary</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{event.tracks.length}</p>
            <p className="text-xs text-muted">Tracks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalSessions}</p>
            <p className="text-xs text-muted">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{assignedSpeakers}</p>
            <p className="text-xs text-muted">Speakers Assigned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {event.price ? `₹${parseFloat(event.price)}` : "Free"}
            </p>
            <p className="text-xs text-muted">Ticket Price</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {event.status === "DRAFT" || event.status === "CANCELLED" ? (
          <Button onClick={handleRequestReview} disabled={submitting || !requiredPassed}>
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Submitting..." : "Request Review"}
          </Button>
        ) : isPending ? (
          <Button variant="outline" onClick={handleWithdraw}>
            Withdraw Request (Back to Draft)
          </Button>
        ) : isPublished ? (
          <p className="text-sm text-muted">Contact an admin to unpublish this event.</p>
        ) : null}
        {!isPublished && (
          <Button variant="outline" onClick={handleDelete} className="text-red-400">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Event
          </Button>
        )}
      </div>

      {!requiredPassed && (event.status === "DRAFT" || event.status === "CANCELLED") && (
        <p className="text-sm text-red-400">
          Complete the required checklist items (red) before submitting for review.
        </p>
      )}
    </div>
  );
}
