import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email! },
  });
}

// GET — list occurrences for an event
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const occurrences = await prisma.eventOccurrence.findMany({
    where: { eventId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ occurrences });
}

// POST — add an occurrence (or bulk-generate from pattern)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.organizerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Bulk generation from pattern
  if (body.pattern) {
    const generated = generateOccurrences(body.pattern);
    if (generated.length === 0) {
      return NextResponse.json({ error: "No dates generated from pattern" }, { status: 400 });
    }

    // Delete existing occurrences
    await prisma.eventOccurrence.deleteMany({ where: { eventId } });

    // Create all occurrences
    const occurrences = await Promise.all(
      generated.map((occ, idx) =>
        prisma.eventOccurrence.create({
          data: {
            eventId,
            label: occ.label,
            startDate: new Date(occ.startDate),
            endDate: new Date(occ.endDate),
            order: idx,
          },
        })
      )
    );

    // Update event's overall startDate / endDate to span full range
    const firstStart = new Date(generated[0].startDate);
    const lastEnd = new Date(generated[generated.length - 1].endDate);
    await prisma.event.update({
      where: { id: eventId },
      data: {
        recurring: true,
        startDate: firstStart,
        endDate: lastEnd,
      },
    });

    return NextResponse.json({ occurrences }, { status: 201 });
  }

  // Single occurrence add
  const { label, startDate, endDate } = body;
  if (!label || !startDate || !endDate) {
    return NextResponse.json(
      { error: "label, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.eventOccurrence.aggregate({
    where: { eventId },
    _max: { order: true },
  });

  const occurrence = await prisma.eventOccurrence.create({
    data: {
      eventId,
      label,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  // Re-compute event date span
  await recalcEventDates(eventId);

  return NextResponse.json({ occurrence }, { status: 201 });
}

// DELETE — remove an occurrence (query param: ?occurrenceId=xxx)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;
  const { searchParams } = new URL(request.url);
  const occurrenceId = searchParams.get("occurrenceId");

  if (!occurrenceId) {
    return NextResponse.json({ error: "occurrenceId required" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.organizerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.eventOccurrence.delete({ where: { id: occurrenceId } });
  await recalcEventDates(eventId);

  return NextResponse.json({ success: true });
}

/* ── Helpers ─────────────────────────────────────────── */

async function recalcEventDates(eventId: string) {
  const occs = await prisma.eventOccurrence.findMany({
    where: { eventId },
    orderBy: { startDate: "asc" },
  });
  if (occs.length > 0) {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        recurring: true,
        startDate: occs[0].startDate,
        endDate: occs[occs.length - 1].endDate,
      },
    });
  }
}

interface PatternInput {
  type: "monthly_weekend" | "monthly_date" | "biweekly" | "custom_dates";
  // For monthly_weekend: which weekend (1st, 2nd, 3rd, 4th), which day (Sat, Sun), how many days
  weekendOrdinal?: number; // 1-4
  dayOfWeek?: number; // 0=Sun, 1=Mon, ... 6=Sat
  durationDays?: number; // e.g. 2 for Sat-Sun
  // For monthly_date: which date (1-28)
  dayOfMonth?: number;
  // Common: start month, number of months
  startMonth: string; // "2026-01"
  months: number; // how many months to generate
  // For custom_dates — array of { label, startDate, endDate }
  dates?: { label: string; startDate: string; endDate: string }[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateOccurrences(pattern: PatternInput) {
  const results: { label: string; startDate: string; endDate: string }[] = [];

  if (pattern.type === "custom_dates" && pattern.dates) {
    return pattern.dates;
  }

  const [startYear, startMonthStr] = pattern.startMonth.split("-").map(Number);
  const months = pattern.months || 12;
  const durationDays = pattern.durationDays || 1;

  for (let i = 0; i < months; i++) {
    let month = startMonthStr - 1 + i; // 0-indexed
    const year = startYear + Math.floor(month / 12);
    month = month % 12;

    let startDate: Date | null = null;

    if (pattern.type === "monthly_weekend") {
      const ordinal = pattern.weekendOrdinal || 1;
      const dow = pattern.dayOfWeek ?? 6; // default Saturday
      startDate = getNthWeekdayOfMonth(year, month, dow, ordinal);
    } else if (pattern.type === "monthly_date") {
      const d = pattern.dayOfMonth || 1;
      startDate = new Date(year, month, d);
    } else if (pattern.type === "biweekly") {
      // Generate 2 occurrences per month (1st and 3rd of given weekday)
      const dow = pattern.dayOfWeek ?? 6;
      const first = getNthWeekdayOfMonth(year, month, dow, 1);
      const third = getNthWeekdayOfMonth(year, month, dow, 3);

      if (first) {
        const end1 = new Date(first);
        end1.setDate(end1.getDate() + durationDays - 1);
        end1.setHours(23, 59, 59);
        results.push({
          label: `${MONTH_NAMES[month]} — Week 1`,
          startDate: first.toISOString(),
          endDate: end1.toISOString(),
        });
      }
      if (third) {
        const end3 = new Date(third);
        end3.setDate(end3.getDate() + durationDays - 1);
        end3.setHours(23, 59, 59);
        results.push({
          label: `${MONTH_NAMES[month]} — Week 3`,
          startDate: third.toISOString(),
          endDate: end3.toISOString(),
        });
      }
      continue;
    }

    if (startDate) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays - 1);
      endDate.setHours(23, 59, 59);

      results.push({
        label: `${MONTH_NAMES[month]} Edition`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    }
  }

  return results;
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  n: number
): Date | null {
  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    if (dt.getDay() === dayOfWeek) {
      count++;
      if (count === n) return dt;
    }
  }
  return null;
}
