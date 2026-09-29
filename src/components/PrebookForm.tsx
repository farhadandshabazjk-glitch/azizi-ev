"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CircleCheck, LoaderCircle } from "lucide-react";

export type BookableModel = {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  status: string;
  price: number;
};

const PLANS = [
  { value: "prebook", label: "Pre-book a unit" },
  { value: "testride", label: "Book a test ride" },
  { value: "callback", label: "Call me back" },
];

export default function PrebookForm({
  models,
  defaultSlug,
}: {
  models: BookableModel[];
  defaultSlug?: string;
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [slug, setSlug] = useState(defaultSlug ?? models[0]?.slug ?? "");
  const [plan, setPlan] = useState("prebook");
  const [rideDate, setRideDate] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        setSignedIn(Boolean(d.user));
        if (d.user?.name) {
          setUserName(d.user.name);
          setName((current) => current || d.user.name);
        }
      })
      .catch(() => setSignedIn(false));
  }, []);

  const selected = models.find((m) => m.slug === slug);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scooterId: selected?.id,
          name,
          phone,
          city,
          plan,
          rideDate,
          note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save your request. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
      setNote("");
    } catch {
      setError("Network problem — please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border-2 border-[var(--color-green)] bg-[#f0f6f1] p-8">
        <CircleCheck className="text-[var(--color-green)]" size={28} />
        <p className="mt-3 font-display text-3xl font-bold leading-none">
          Noted{userName ? `, ${userName.split(" ")[0]}` : ""}.
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Your request for <strong>{selected?.name ?? "a scooter"}</strong> is on our register.
          We will confirm on call before anything is charged. Booking amount is refundable
          until the day of delivery.
        </p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => setState("idle")}>
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {signedIn === false && (
        <p className="border-l-4 border-[var(--color-marigold)] bg-[#fbf3e6] px-4 py-3 text-sm">
          Pre-booking is tied to a mobile number so nobody else can claim your unit.{" "}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Sign in / register with your mobile
          </Link>
          .
        </p>
      )}

      <div>
        <span className="micro mb-2 block text-[var(--color-stone)]">I want to</span>
        <div className="flex flex-wrap gap-2">
          {PLANS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlan(p.value)}
              className={`micro border-2 px-3.5 py-2.5 transition-colors ${
                plan === p.value
                  ? "border-[var(--color-green-dark)] bg-[var(--color-green)] text-[var(--color-paper)]"
                  : "border-[var(--color-rule)] hover:border-[var(--color-green)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="micro mb-1.5 block text-[var(--color-stone)]">Scooter</span>
        <select className="field" value={slug} onChange={(e) => setSlug(e.target.value)} required>
          {models.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
              {m.variant ? ` — ${m.variant}` : ""}
              {m.status === "coming_soon" ? " (arriving soon)" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">Your name</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="Full name"
          />
        </label>
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">Mobile number</span>
          <input
            className="field num"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={20}
            inputMode="numeric"
            placeholder="10-digit mobile"
          />
        </label>
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">City / village</span>
          <input
            className="field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={60}
            placeholder="e.g. Sikar"
          />
        </label>
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">
            {plan === "testride" ? "Preferred ride date" : "Preferred visit date"}
          </span>
          <input
            className="field num"
            type="date"
            value={rideDate}
            onChange={(e) => setRideDate(e.target.value)}
            maxLength={30}
          />
        </label>
      </div>

      <label className="block">
        <span className="micro mb-1.5 block text-[var(--color-stone)]">
          Anything we should know?
        </span>
        <textarea
          className="field min-h-[110px] resize-y"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={600}
          placeholder="Colour preference, exchange scooter, finance needed, best time to call…"
        />
      </label>

      {error && (
        <p className="border-l-4 border-red-700 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-marigold w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? <LoaderCircle size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
        {plan === "testride" ? "Book my test ride" : plan === "callback" ? "Request a call" : "Reserve my unit"}
      </button>
      <p className="micro text-[var(--color-stone)]">
        No payment online · we confirm every request on call
      </p>
    </form>
  );
}
