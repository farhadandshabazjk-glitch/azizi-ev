import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import { bookings, messages, scooters, stockLogs, users } from "@/db/schema";
import { asc, desc, eq, or } from "drizzle-orm";

export async function listScooters() {
  await ensureSeed();
  return db.select().from(scooters).orderBy(asc(scooters.sortOrder), asc(scooters.name));
}

export async function getScooter(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(scooters).where(eq(scooters.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getScooterById(id: string) {
  const rows = await db.select().from(scooters).where(eq(scooters.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listBookings() {
  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200);
}

export async function listMessages() {
  return db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);
}

export async function listStockLogs() {
  return db.select().from(stockLogs).orderBy(desc(stockLogs.createdAt)).limit(40);
}

export async function userByPhone(phone: string) {
  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return rows[0] ?? null;
}

export async function userBookings(userId: string) {
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function userMessages(userId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt));
}

export async function ownedRows(userId: string) {
  return {
    bookings: await userBookings(userId),
    messages: await userMessages(userId),
  };
}

export async function logStockChange(input: {
  scooterId: string;
  scooterName: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
}) {
  await db.insert(stockLogs).values(input);
}

export function searchScootersWhere(term: string) {
  return or(
    eq(scooters.slug, term),
    eq(scooters.name, term)
  );
}
