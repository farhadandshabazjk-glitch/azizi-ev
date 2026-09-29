const inrFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function inr(value: number): string {
  return `₹${inrFormatter.format(Math.round(value || 0))}`;
}

export function shortDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export const STATUS_LABEL: Record<string, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  coming_soon: "Coming soon",
};

export const BOOKING_STATUS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const SITE = {
  phone: "8058987070",
  phoneDisplay: "+91 80589 87070",
  whatsapp: "918058987070",
  instagram:
    "https://www.instagram.com/azizievehicle_zelio?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==",
  instagramHandle: "azizievehicle_zelio",
  showroom: "Azizi EV Showroom, Station Road, Sikar, Rajasthan",
  hours: "Mon – Sat 9:30 am – 8:30 pm · Sunday 10 am – 2 pm",
};
