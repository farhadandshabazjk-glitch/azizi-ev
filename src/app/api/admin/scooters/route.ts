import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { scooters } from "@/db/schema";
import { getScooterById, logStockChange } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const scooterFields = {
  name: z.string().trim().min(2).max(80),
  variant: z.string().trim().max(80).nullable().optional(),
  tagline: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  price: z.number().int().min(0).max(500000),
  rangeKm: z.number().int().min(0).max(1000),
  topSpeed: z.number().int().min(0).max(200),
  battery: z.string().trim().max(80).nullable().optional(),
  charging: z.string().trim().max(60).nullable().optional(),
  motor: z.string().trim().max(60).nullable().optional(),
  warranty: z.string().trim().max(80).nullable().optional(),
  colors: z.string().trim().max(160).nullable().optional(),
  image: z.string().trim().max(200).nullable().optional(),
  units: z.number().int().min(0).max(999),
  status: z.enum(["in_stock", "low_stock", "coming_soon"]),
  arrivalNote: z.string().trim().max(120).nullable().optional(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
};

const createSchema = z.object(scooterFields);
const patchSchema = createSchema.partial().extend({ id: z.string().uuid() });

async function requireAdmin() {
  const session = await getSession();
  return session && session.role === "admin" ? session : null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const AUDITED = ["price", "units", "status"] as const;

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  const rows = await db
    .select()
    .from(scooters)
    .orderBy(asc(scooters.sortOrder), asc(scooters.name));
  return Response.json({ scooters: rows });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  const ip = clientIp(request);
  if (!rateLimit(`admin-writes:${ip}`, 60, 60_000)) {
    return Response.json({ error: "Too many changes. Please slow down." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Please check the scooter details." }, { status: 400 });
  }

  const base = slugify(parsed.data.name);
  const slug = base || `scooter-${Date.now()}`;
  const [row] = await db
    .insert(scooters)
    .values({ ...parsed.data, slug, updatedAt: new Date() })
    .returning();
  await logStockChange({
    scooterId: row.id,
    scooterName: row.name,
    field: "created",
    oldValue: "—",
    newValue: `${row.status} · ${row.units} units`,
    changedBy: session.name,
  });
  return Response.json({ scooter: row }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  const ip = clientIp(request);
  if (!rateLimit(`admin-writes:${ip}`, 60, 60_000)) {
    return Response.json({ error: "Too many changes. Please slow down." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.id) {
    return Response.json({ error: "Please check the scooter details." }, { status: 400 });
  }

  const existing = await getScooterById(parsed.data.id);
  if (!existing) return Response.json({ error: "Scooter not found." }, { status: 404 });

  const { id, ...changes } = parsed.data;
  const [row] = await db
    .update(scooters)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(scooters.id, id))
    .returning();

  for (const field of AUDITED) {
    const before = existing[field];
    const after = row[field];
    if (String(before) !== String(after)) {
      await logStockChange({
        scooterId: row.id,
        scooterName: row.name,
        field,
        oldValue: String(before),
        newValue: String(after),
        changedBy: session.name,
      });
    }
  }

  return Response.json({ scooter: row });
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  const ip = clientIp(request);
  if (!rateLimit(`admin-writes:${ip}`, 60, 60_000)) {
    return Response.json({ error: "Too many changes. Please slow down." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = z.object({ id: z.string().uuid() }).safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  const existing = await getScooterById(parsed.data.id);
  if (!existing) return Response.json({ error: "Scooter not found." }, { status: 404 });
  await db.delete(scooters).where(eq(scooters.id, parsed.data.id));
  await logStockChange({
    scooterId: existing.id,
    scooterName: existing.name,
    field: "removed",
    oldValue: `${existing.status} · ${existing.units} units`,
    newValue: "—",
    changedBy: session.name,
  });
  return Response.json({ ok: true });
}
