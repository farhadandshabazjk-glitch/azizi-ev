import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getScooterById, userBookings } from "@/db/queries";
import { getSession, normalizePhone } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  scooterId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  city: z.string().trim().max(60).optional(),
  plan: z.enum(["prebook", "testride", "callback"]).default("prebook"),
  rideDate: z.string().trim().max(30).optional(),
  note: z.string().trim().max(600).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });
  return Response.json({ bookings: await userBookings(session.sub) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Please sign in with your mobile number first." }, { status: 401 });
  }
  const ip = clientIp(request);
  if (!rateLimit(`booking:${session.sub}`, 8, 60_000)) {
    return Response.json({ error: "Please slow down and try again shortly." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Please fill in all the required details." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return Response.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }

  const scooter = await getScooterById(parsed.data.scooterId);
  if (!scooter) {
    return Response.json({ error: "That scooter is not in our list any more." }, { status: 404 });
  }

  const [row] = await db
    .insert(bookings)
    .values({
      userId: session.sub,
      name: parsed.data.name,
      phone,
      city: parsed.data.city?.trim() || null,
      scooterId: scooter.id,
      scooterName: `${scooter.name}${scooter.variant ? ` · ${scooter.variant}` : ""}`,
      plan: parsed.data.plan,
      rideDate: parsed.data.rideDate?.trim() || null,
      note: parsed.data.note?.trim() || null,
      status: "new",
    })
    .returning();

  return Response.json({ booking: row }, { status: 201 });
}
