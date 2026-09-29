import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { userMessages } from "@/db/queries";
import { getSession, normalizePhone } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  topic: z.string().trim().max(60).optional(),
  body: z.string().trim().min(5).max(1200),
});

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });
  return Response.json({ messages: await userMessages(session.sub) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Please sign in with your mobile number first." }, { status: 401 });
  }
  const ip = clientIp(request);
  if (!rateLimit(`message:${session.sub}`, 8, 60_000)) {
    return Response.json({ error: "Please slow down and try again shortly." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Please write a short message (5 characters or more)." }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return Response.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }

  const [row] = await db
    .insert(messages)
    .values({
      userId: session.sub,
      name: parsed.data.name,
      phone,
      topic: parsed.data.topic?.trim() || "General",
      body: parsed.data.body,
      status: "new",
    })
    .returning();

  return Response.json({ message: row }, { status: 201 });
}
