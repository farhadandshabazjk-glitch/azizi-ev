"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeIndianRupee,
  ClipboardList,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCw,
  Save,
  Trash,
} from "lucide-react";
import { inr, shortDate, timeAgo, BOOKING_STATUS, STATUS_LABEL } from "@/lib/format";

type Scooter = {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  tagline: string | null;
  description: string | null;
  price: number;
  rangeKm: number;
  topSpeed: number;
  battery: string | null;
  charging: string | null;
  motor: string | null;
  warranty: string | null;
  colors: string | null;
  image: string | null;
  units: number;
  status: "in_stock" | "low_stock" | "coming_soon";
  arrivalNote: string | null;
  featured: boolean;
  sortOrder: number;
};

type Booking = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  scooterName: string | null;
  plan: string;
  rideDate: string | null;
  note: string | null;
  status: string;
  createdAt: string;
};

type Message = {
  id: string;
  name: string;
  phone: string;
  topic: string | null;
  body: string;
  status: string;
  reply: string | null;
  createdAt: string;
};

type Log = {
  id: string;
  scooterName: string | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  createdAt: string;
};

type Stats = {
  scooters: number;
  bookings: number;
  messages: number;
  customers: number;
  newBookings: number;
  newMessages: number;
};

const TABS = [
  { key: "stock", label: "Stock & prices", icon: BadgeIndianRupee },
  { key: "bookings", label: "Pre-bookings", icon: ClipboardList },
  { key: "messages", label: "Messages", icon: MessageSquareText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const BLANK = {
  name: "",
  variant: "",
  tagline: "",
  description: "",
  price: 60000,
  rangeKm: 80,
  topSpeed: 25,
  battery: "",
  charging: "",
  motor: "",
  warranty: "",
  colors: "",
  image: "",
  units: 0,
  status: "coming_soon" as Scooter["status"],
  arrivalNote: "",
  featured: false,
  sortOrder: 10,
};

export default function AdminApp() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<TabKey>("stock");
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Scooter>>>({});
  const [newOne, setNewOne] = useState<typeof BLANK | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [overview, stock, book, msg] = await Promise.all([
      fetch("/api/admin", { credentials: "same-origin" }).then((r) => r.json()),
      fetch("/api/admin/scooters", { credentials: "same-origin" }).then((r) => r.json()),
      fetch("/api/admin/bookings", { credentials: "same-origin" }).then((r) => r.json()),
      fetch("/api/admin/messages", { credentials: "same-origin" }).then((r) => r.json()),
    ]);
    if (overview.stats) setStats(overview.stats);
    if (overview.logs) setLogs(overview.logs);
    if (stock.scooters) setScooters(stock.scooters);
    if (book.bookings) setBookings(book.bookings);
    if (msg.messages) setMessages(msg.messages);
  }, []);

  useEffect(() => {
    fetch("/api/admin", { credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) {
          setAuthed(false);
          return;
        }
        setAuthed(true);
        await load();
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecked(true));
  }, [load]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error ?? "Sign-in failed.");
      return;
    }
    setPassword("");
    setAuthed(true);
    setChecked(true);
    await load();
  }

  async function signOut() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
    router.refresh();
  }

  function setDraft(id: string, patch: Partial<Scooter>) {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? {}), ...patch } }));
  }

  async function saveScooter(s: Scooter) {
    setBusy(true);
    const patch = drafts[s.id] ?? {};
    const res = await fetch("/api/admin/scooters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, ...patch }),
    });
    setBusy(false);
    if (res.ok) {
      setNotice(`${s.name} updated`);
      setDrafts((d) => {
        const next = { ...d };
        delete next[s.id];
        return next;
      });
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error ?? "Could not save changes");
    }
  }

  async function removeScooter(s: Scooter) {
    if (!window.confirm(`Remove ${s.name} from the stock board?`)) return;
    setBusy(true);
    await fetch("/api/admin/scooters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id }),
    });
    setBusy(false);
    setNotice(`${s.name} removed`);
    await load();
  }

  async function createScooter() {
    if (!newOne) return;
    setBusy(true);
    const res = await fetch("/api/admin/scooters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOne),
    });
    setBusy(false);
    if (res.ok) {
      setNewOne(null);
      setNotice("Scooter added to the board");
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error ?? "Could not add scooter");
    }
  }

  async function updateBooking(id: string, status: string) {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  async function replyToMessage(m: Message, reply: string) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, reply, status: reply ? "replied" : "new" }),
    });
    setNotice("Reply saved — the customer can see it in their account");
    await load();
  }

  if (!checked) {
    return (
      <div className="flex items-center gap-3 px-6 py-28 text-[var(--color-stone)]">
        <LoaderCircle size={18} className="animate-spin" /> Checking access…
      </div>
    );
  }

  if (!authed) {
    return (
      <section className="mx-auto grid max-w-[1000px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="micro text-[var(--color-marigold-ink)]">Staff entry</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.2rem)] font-extrabold leading-[0.88]">
            Showroom
            <br />
            stock desk.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
            This is the owner area. Only the showroom owner can change prices, stock counts
            and status — every change is recorded in the change log with a timestamp.
          </p>
          <p className="mt-6 text-sm text-[var(--color-stone)]">
            Customer?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in here instead
            </Link>
            .
          </p>
        </div>

        <form onSubmit={signIn} className="plate bg-[var(--color-paper-2)] p-6 sm:p-9">
          <h2 className="font-display text-[2rem] font-bold leading-none">Owner sign-in</h2>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="micro mb-1.5 block text-[var(--color-stone)]">Email</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="micro mb-1.5 block text-[var(--color-stone)]">Password</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {loginError && (
              <p className="border-l-4 border-red-700 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                {loginError}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? <LoaderCircle size={15} className="animate-spin" /> : null}
              Sign in to the stock desk
            </button>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-stone)]">
            Access is limited by rate limiting and signed session cookies. Nothing from this
            area is ever sent to the browser of a visitor.
          </p>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[var(--color-green-dark)] pb-8">
        <div>
          <p className="micro text-[var(--color-marigold-ink)]">Stock desk</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5.4vw,3.8rem)] font-extrabold leading-[0.88]">
            Keep the board honest.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="btn btn-ghost" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-px border-2 border-[var(--color-green-dark)] bg-[var(--color-green-dark)] md:grid-cols-6">
          {[
            { k: "Models", v: stats.scooters },
            { k: "Units on floor", v: scooters.reduce((a, s) => a + s.units, 0) },
            { k: "Pre-bookings", v: stats.bookings },
            { k: "Messages", v: stats.messages },
            { k: "New requests", v: stats.newBookings },
            { k: "Unanswered", v: stats.newMessages },
          ].map((s) => (
            <div key={s.k} className="bg-[var(--color-paper)] px-4 py-4">
              <p className="num text-2xl font-semibold leading-none">{s.v}</p>
              <p className="micro mt-1.5 text-[var(--color-stone)]">{s.k}</p>
            </div>
          ))}
        </div>
      )}

      {notice && (
        <p className="mt-5 border-l-4 border-[var(--color-green)] bg-[#eef4ef] px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`micro flex items-center gap-2 border-2 px-4 py-2.5 transition-colors ${
                active
                  ? "border-[var(--color-green-dark)] bg-[var(--color-green)] text-[var(--color-paper)]"
                  : "border-[var(--color-rule)] hover:border-[var(--color-green)]"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ——— STOCK ——— */}
      {tab === "stock" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="micro text-[var(--color-stone)]">
              Change price, units or status — the public board updates immediately
            </p>
            <button
              type="button"
              className="btn btn-marigold"
              onClick={() => setNewOne(newOne ? null : { ...BLANK })}
            >
              <Plus size={15} /> Add a scooter
            </button>
          </div>

          {newOne && (
            <div className="mt-6 border-2 border-[var(--color-marigold-ink)] bg-[#fbf3e6] p-5">
              <h3 className="font-display text-[1.55rem] font-bold leading-none">
                New scooter
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["name", "Name"],
                    ["variant", "Variant"],
                    ["tagline", "Tagline"],
                    ["battery", "Battery"],
                    ["charging", "Charging time"],
                    ["motor", "Motor"],
                    ["warranty", "Warranty"],
                    ["colors", "Colours (comma separated)"],
                    ["image", "Image path (e.g. images/eeva.jpg)"],
                    ["arrivalNote", "Arrival note (for coming soon)"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="micro mb-1 block text-[var(--color-stone)]">{label}</span>
                    <input
                      className="field"
                      value={String(newOne[key] ?? "")}
                      onChange={(e) => setNewOne({ ...newOne, [key]: e.target.value })}
                    />
                  </label>
                ))}
                {(
                  [
                    ["price", "Price ₹"],
                    ["rangeKm", "Range km"],
                    ["topSpeed", "Top speed km/h"],
                    ["units", "Units in stock"],
                    ["sortOrder", "Sort order"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="micro mb-1 block text-[var(--color-stone)]">{label}</span>
                    <input
                      className="field num"
                      type="number"
                      value={Number(newOne[key] ?? 0)}
                      onChange={(e) => setNewOne({ ...newOne, [key]: Number(e.target.value) })}
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="micro mb-1 block text-[var(--color-stone)]">Status</span>
                  <select
                    className="field"
                    value={newOne.status}
                    onChange={(e) =>
                      setNewOne({ ...newOne, status: e.target.value as Scooter["status"] })
                    }
                  >
                    <option value="in_stock">In stock</option>
                    <option value="low_stock">Low stock</option>
                    <option value="coming_soon">Coming soon</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" className="btn btn-primary" onClick={createScooter}>
                  <Save size={15} /> Add to the board
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setNewOne(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {scooters.map((s) => {
              const d = drafts[s.id] ?? {};
              const price = d.price ?? s.price;
              const units = d.units ?? s.units;
              const status = d.status ?? s.status;
              return (
                <div
                  key={s.id}
                  className="border-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-[1.65rem] font-bold leading-none">
                        {s.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-[var(--color-stone)]">{s.variant}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>
                      <button
                        type="button"
                        className="border-2 border-[var(--color-rule)] p-2 text-red-800 transition-colors hover:border-red-800"
                        onClick={() => removeScooter(s)}
                        aria-label={`Remove ${s.name}`}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                      <span className="micro mb-1 block text-[var(--color-stone)]">
                        Price (₹)
                      </span>
                      <input
                        className="field num"
                        type="number"
                        value={price}
                        onChange={(e) => setDraft(s.id, { price: Number(e.target.value) })}
                      />
                      <span className="micro mt-1 block text-[var(--color-stone)]">
                        showing {inr(price)}
                      </span>
                    </label>
                    <label className="block">
                      <span className="micro mb-1 block text-[var(--color-stone)]">
                        Units in showroom
                      </span>
                      <input
                        className="field num"
                        type="number"
                        value={units}
                        onChange={(e) => setDraft(s.id, { units: Number(e.target.value) })}
                      />
                    </label>
                    <label className="block">
                      <span className="micro mb-1 block text-[var(--color-stone)]">Status</span>
                      <select
                        className="field"
                        value={status}
                        onChange={(e) =>
                          setDraft(s.id, { status: e.target.value as Scooter["status"] })
                        }
                      >
                        <option value="in_stock">In stock</option>
                        <option value="low_stock">Low stock</option>
                        <option value="coming_soon">Coming soon</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="micro mb-1 block text-[var(--color-stone)]">
                        Arrival note
                      </span>
                      <input
                        className="field"
                        value={d.arrivalNote ?? s.arrivalNote ?? ""}
                        onChange={(e) => setDraft(s.id, { arrivalNote: e.target.value })}
                        placeholder="e.g. Expected next month"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busy || Object.keys(d).length === 0}
                      onClick={() => saveScooter(s)}
                    >
                      <Save size={15} /> Save changes
                    </button>
                    {Object.keys(d).length > 0 && (
                      <span className="micro text-[var(--color-marigold-ink)]">
                        Unsaved changes
                      </span>
                    )}
                    <Link
                      href={`/scooters/${s.slug}`}
                      className="micro ml-auto text-[var(--color-stone)] underline underline-offset-4"
                    >
                      View public page
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="mt-12 font-display text-[1.8rem] font-bold leading-none">
            Change log
          </h3>
          <div className="mt-4 border-t-2 border-[var(--color-green-dark)]">
            {logs.length === 0 && (
              <p className="py-6 text-sm text-[var(--color-stone)]">No changes recorded yet.</p>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                className="ledger-paper grid grid-cols-2 gap-3 border-b border-[var(--color-rule)] py-3 text-sm md:grid-cols-[1.2fr_0.8fr_1fr_1fr_0.8fr]"
              >
                <span className="font-medium">{l.scooterName}</span>
                <span className="micro text-[var(--color-marigold-ink)]">{l.field}</span>
                <span className="num text-[var(--color-stone)]">{l.oldValue}</span>
                <span className="num">{l.newValue}</span>
                <span className="micro text-[var(--color-stone)]">{timeAgo(l.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ——— BOOKINGS ——— */}
      {tab === "bookings" && (
        <div className="mt-8 space-y-4">
          {bookings.length === 0 && (
            <p className="border border-dashed border-[var(--color-rule)] px-5 py-10 text-sm text-[var(--color-stone)]">
              No pre-bookings or test ride requests yet.
            </p>
          )}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-display text-[1.5rem] font-bold leading-none">{b.name}</h3>
                <a href={`tel:+91${b.phone}`} className="num text-base text-[var(--color-green)] underline underline-offset-4">
                  {b.phone}
                </a>
                <span className="text-sm text-[var(--color-stone)]">{b.city}</span>
                <span className="micro ml-auto text-[var(--color-stone)]">
                  {shortDate(b.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                <strong>{b.scooterName}</strong> ·{" "}
                {b.plan === "testride" ? "test ride" : b.plan === "callback" ? "call back" : "pre-book"}
                {b.rideDate ? ` · preferred ${b.rideDate}` : ""}
              </p>
              {b.note && (
                <p className="mt-3 border-l-4 border-[var(--color-rule)] pl-3 text-sm">
                  {b.note}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  className="field max-w-[220px]"
                  value={b.status}
                  onChange={(e) => updateBooking(b.id, e.target.value)}
                >
                  {Object.entries(BOOKING_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <a
                  href={`https://wa.me/91${b.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  WhatsApp customer
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ——— MESSAGES ——— */}
      {tab === "messages" && (
        <div className="mt-8 space-y-4">
          {messages.length === 0 && (
            <p className="border border-dashed border-[var(--color-rule)] px-5 py-10 text-sm text-[var(--color-stone)]">
              No customer messages yet.
            </p>
          )}
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} onReply={replyToMessage} />
          ))}
        </div>
      )}
    </section>
  );
}

function MessageCard({
  message,
  onReply,
}: {
  message: Message;
  onReply: (m: Message, reply: string) => Promise<void>;
}) {
  const [reply, setReply] = useState(message.reply ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="border-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] p-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-display text-[1.4rem] font-bold leading-none">{message.name}</h3>
        <a href={`tel:+91${message.phone}`} className="num text-base text-[var(--color-green)] underline underline-offset-4">
          {message.phone}
        </a>
        <span className="micro text-[var(--color-marigold-ink)]">{message.topic}</span>
        <span className="micro ml-auto text-[var(--color-stone)]">
          {shortDate(message.createdAt)}
        </span>
      </div>
      <p className="mt-3 leading-relaxed">{message.body}</p>

      <label className="mt-4 block">
        <span className="micro mb-1.5 block text-[var(--color-stone)]">
          Your reply (visible in the customer&apos;s account)
        </span>
        <textarea
          className="field min-h-[90px] resize-y"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type the answer you would give on call…"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onReply(message, reply);
            setSaving(false);
          }}
        >
          <Save size={15} /> Save reply
        </button>
        <span
          className={`chip ${
            message.status === "new"
              ? "chip-low_stock"
              : "chip-in_stock"
          }`}
        >
          {message.status === "new" ? "Unanswered" : message.status === "replied" ? "Replied" : "Closed"}
        </span>
        <a
          href={`https://wa.me/91${message.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost ml-auto"
        >
          WhatsApp customer
        </a>
      </div>
    </div>
  );
}
