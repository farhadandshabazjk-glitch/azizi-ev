import { NextRequest } from "next/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings, messages, scooters, users } from "@/db/schema";
import { listStockLogs } from "@/db/queries";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  verifyAdmin,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  action: z.enum(["login", "logout", "overview"]),
  email: z.string().trim().max(120).optional(),
  password: z.string().max(120).optional(),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });

  const [stock] = await db.select({ value: count() }).from(scooters);
  const [bookingsCount] = await db.select({ value: count() }).from(bookings);
  const [messagesCount] = await db.select({ value: count() }).from(messages);
  const [customers] = await db.select({ value: count() }).from(users);
  const [newBookings] = await db
    .select({ value: count() })
    .from(bookings)
    .where(eq(bookings.status, "new"));
  const [newMessages] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.status, "new"));

  return Response.json({
    stats: {
      scooters: stock?.value ?? 0,
      bookings: bookingsCount?.value ?? 0,
      messages: messagesCount?.value ?? 0,
      customers: customers?.value ?? 0,
      newBookings: newBookings?.value ?? 0,
      newMessages: newMessages?.value ?? 0,
    },
    logs: await listStockLogs(),
  });
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!rateLimit(`admin:${ip}`, 8, 60_000)) {
    return Response.json(
      { error: "Too many sign-in attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  if (parsed.data.action === "logout") {
    await clearSessionCookie();
    return Response.json({ ok: true });
  }

  const email = parsed.data.email ?? "";
  const password = parsed.data.password ?? "";
  if (!verifyAdmin(email, password)) {
    return Response.json({ error: "Sign-in failed. Check your credentials." }, { status: 401 });
  }
  await setSessionCookie({ sub: "owner", role: "admin", name: "Showroom owner" });
  return Response.json({ ok: true });
}
