import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { listMessages } from "@/db/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "replied", "closed"]).optional(),
  reply: z.string().trim().max(1200).nullable().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  return session && session.role === "admin" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Not authorised." }, { status: 401 });
  return Response.json({ messages: await listMessages() });
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
    .update(messages)
    .set(changes)
    .where(eq(messages.id, id))
    .returning();
  if (!row) return Response.json({ error: "Message not found." }, { status: 404 });
  return Response.json({ message: row });
}
