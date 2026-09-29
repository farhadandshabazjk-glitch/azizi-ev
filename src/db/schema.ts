import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    phone: varchar("phone", { length: 15 }).notNull().unique(),
    city: varchar("city", { length: 60 }),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).default("customer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("users_phone_idx").on(t.phone)]
);

export const scooters = pgTable("scooters", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  variant: varchar("variant", { length: 80 }),
  tagline: varchar("tagline", { length: 160 }),
  description: text("description"),
  price: integer("price").notNull().default(0),
  rangeKm: integer("range_km").notNull().default(0),
  topSpeed: integer("top_speed").notNull().default(25),
  battery: varchar("battery", { length: 80 }),
  charging: varchar("charging", { length: 60 }),
  motor: varchar("motor", { length: 60 }),
  warranty: varchar("warranty", { length: 80 }),
  colors: text("colors").default(""),
  image: varchar("image", { length: 200 }),
  units: integer("units").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("in_stock"),
  arrivalNote: varchar("arrival_note", { length: 120 }),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: varchar("city", { length: 60 }),
  scooterId: uuid("scooter_id").references(() => scooters.id),
  scooterName: varchar("scooter_name", { length: 100 }),
  plan: varchar("plan", { length: 30 }).default("prebook"),
  rideDate: varchar("ride_date", { length: 30 }),
  note: text("note"),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  topic: varchar("topic", { length: 60 }),
  body: text("body").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  reply: text("reply"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stockLogs = pgTable("stock_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  scooterId: uuid("scooter_id").references(() => scooters.id),
  scooterName: varchar("scooter_name", { length: 100 }),
  field: varchar("field", { length: 40 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: varchar("changed_by", { length: 80 }).default("owner").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Scooter = typeof scooters.$inferSelect;
export type NewScooter = typeof scooters.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type StockLog = typeof stockLogs.$inferSelect;
