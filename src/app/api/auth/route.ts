import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearSessionCookie,
  getSession,
  hashPassword,
  normalizePhone,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const credentialsSchema = z.object({
  action: z.enum(["login", "register", "logout"]),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  password: z.string().min(6).max(72).optional(),
  city: z.string().trim().max(60).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  return Response.json({
    user: { id: session.sub, name: session.name, role: session.role },
  });
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!rateLimit(`auth:${ip}`, 12, 60_000)) {
    return Response.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Please check the details and try again." }, { status: 400 });
  }
  const { action, password } = parsed.data;

  if (action === "logout") {
    await clearSessionCookie();
    return Response.json({ ok: true });
  }

  if (!password) {
    return Response.json({ error: "Please enter your password." }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone ?? "");
  if (!phone) {
    return Response.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  if (action === "register") {
    const name = parsed.data.name?.trim();
    if (!name || name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing.length > 0) {
      return Response.json(
        { error: "This number is already registered. Try logging in." },
        { status: 409 }
      );
    }
    const [created] = await db
      .insert(users)
      .values({
        name,
        phone,
        city: parsed.data.city?.trim() || null,
        passwordHash: hashPassword(password),
        role: "customer",
      })
      .returning();
    await setSessionCookie({ sub: created.id, role: "customer", name: created.name });
    return Response.json(
      { user: { id: created.id, name: created.name, phone: created.phone, role: "customer" } },
      { status: 201 }
    );
  }

  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Wrong mobile number or password." }, { status: 401 });
  }
  await setSessionCookie({ sub: user.id, role: "customer", name: user.name });
  return Response.json({
    user: { id: user.id, name: user.name, phone: user.phone, role: "customer" },
  });
}
