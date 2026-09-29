import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { listBookings } from "@/db/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "confirmed", "delivered", "cancelled"]).optional(),
  note: z.string().trim().max(600).nullable().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  return session && session.role === "admin" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  return Response.json({ bookings: await listBookings() });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  const { id, ...changes } = parsed.data;
  const [row] = await db
    .update(bookings)
    .set(changes)
    .where(eq(bookings.id, id))
    .returning();
  if (!row) return Response.json({ error: "Booking not found." }, { status: 404 });
  return Response.json({ booking: row });
}
