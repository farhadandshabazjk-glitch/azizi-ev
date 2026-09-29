import { db } from "@/db";
import { scooters } from "@/db/schema";
import { count } from "drizzle-orm";

const seedFlag = globalThis as typeof globalThis & { __aziziSeeded?: boolean };

const SEED_ROWS = [
  {
    slug: "eeva-eco",
    name: "Eeva Eco",
    variant: "48V / 32Ah gel battery",
    tagline: "The everyday city runabout — no licence, no registration.",
    description:
      "The scooter most of our customers ride home. Light, easy to park and cheap to run at roughly 22 paise per kilometre. Comes with reverse gear, parking switch, remote lock and an anti-theft alarm.",
    price: 54900,
    rangeKm: 60,
    topSpeed: 25,
    battery: "48V / 32Ah gel",
    charging: "6–8 hrs",
    motor: "60V BLDC hub",
    warranty: "1 year battery · 3 year motor",
    colors: "Pearl White, Grey, Red",
    image: "images/eeva.jpg",
    units: 4,
    status: "low_stock",
    arrivalNote: null as string | null,
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "gracy-i",
    name: "Gracy-i",
    variant: "60V / 30Ah lithium-ion",
    tagline: "Family scooter with a full-size boot and a removable battery.",
    description:
      "Longer wheelbase, wider seat and a battery you can lift out and charge at home or in the shop. Telescopic suspension front and rear keeps the potholes off your back.",
    price: 72500,
    rangeKm: 85,
    topSpeed: 25,
    battery: "60V / 30Ah Li-ion",
    charging: "4 hrs",
    motor: "60V BLDC hub",
    warranty: "2 year battery · 3 year motor",
    colors: "Enamel Green, Ivory, Black",
    image: "images/gracy.jpg",
    units: 6,
    status: "in_stock",
    arrivalNote: null,
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "eeva-zx-plus",
    name: "Eeva ZX+",
    variant: "60V / 30Ah lithium-ion",
    tagline: "Retro body, modern battery — our best-selling lithium scooter.",
    description:
      "Round LED headlamp, chrome mirrors and a silent lithium drivetrain. Digital cluster shows speed, charge and trip, and the USB port keeps your phone alive on the way to work.",
    price: 89900,
    rangeKm: 100,
    topSpeed: 25,
    battery: "60V / 30Ah Li-ion",
    charging: "4 hrs",
    motor: "60V BLDC hub",
    warranty: "2 year battery · 3 year motor",
    colors: "Marigold, Pearl White, Blue",
    image: "images/zxplus.jpg",
    units: 9,
    status: "in_stock",
    arrivalNote: null,
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "legender",
    name: "Legender",
    variant: "High-speed 72V / 42Ah",
    tagline: "Registered high-speed scooter for highway-side commutes.",
    description:
      "The one for longer rides — 55 km/h, disc brake up front, 180 kg load capacity and a full digital cluster. RTO registration and helmet included in our on-road package.",
    price: 104900,
    rangeKm: 120,
    topSpeed: 55,
    battery: "72V / 42Ah Li-ion",
    charging: "5 hrs",
    motor: "2000W BLDC",
    warranty: "2 year battery · 3 year motor",
    colors: "Charcoal, Marigold, White",
    image: "images/legender.jpg",
    units: 2,
    status: "low_stock",
    arrivalNote: null,
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "gracy-plus",
    name: "Gracy Plus",
    variant: "72V / 42Ah lithium-ion",
    tagline: "Bigger battery Gracy — first lot lands next month.",
    description:
      "Everything customers asked for on the Gracy-i: bigger battery, side-stand sensor, LED DRL and a wider floorboard. Booking amount is fully refundable until delivery.",
    price: 98000,
    rangeKm: 110,
    topSpeed: 25,
    battery: "72V / 42Ah Li-ion",
    charging: "4–5 hrs",
    motor: "60V BLDC hub",
    warranty: "2 year battery · 3 year motor",
    colors: "Ivory, Green",
    image: null as string | null,
    units: 0,
    status: "coming_soon",
    arrivalNote: "Expected first week of next month",
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "legender-pro",
    name: "Legender Pro",
    variant: "High-speed 72V / 60Ah",
    tagline: "Flagship long-range scooter — demo bike arriving soon.",
    description:
      "Dual-disc, 150 km claimed range and a swappable battery option for fleet riders. We are opening bookings before the first lot reaches the showroom.",
    price: 129900,
    rangeKm: 150,
    topSpeed: 60,
    battery: "72V / 60Ah Li-ion",
    charging: "5–6 hrs",
    motor: "3000W BLDC",
    warranty: "3 year battery · 3 year motor",
    colors: "Charcoal, Marigold",
    image: null,
    units: 0,
    status: "coming_soon",
    arrivalNote: "Demo bike expected in 6–8 weeks",
    featured: false,
    sortOrder: 6,
  },
];

export async function ensureSeed(): Promise<void> {
  if (seedFlag.__aziziSeeded) return;
  try {
    const [row] = await db.select({ c: count() }).from(scooters);
    if (row && row.c > 0) {
      seedFlag.__aziziSeeded = true;
      return;
    }
    await db.insert(scooters).values(SEED_ROWS).onConflictDoNothing();
    seedFlag.__aziziSeeded = true;
  } catch (error) {
    console.error("seed failed", error);
  }
}
