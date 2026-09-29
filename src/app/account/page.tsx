"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut, MessageSquareText, CalendarCheck } from "lucide-react";
import { inr, shortDate, BOOKING_STATUS } from "@/lib/format";

type SessionUser = { id: string; name: string; role: string } | null;
type BookingRow = {
  id: string;
  scooterName: string | null;
  plan: string;
  rideDate: string | null;
  status: string;
  note: string | null;
  createdAt: string;
};
type MessageRow = {
  id: string;
  topic: string | null;
  body: string;
  status: string;
  reply: string | null;
  createdAt: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const authRes = await fetch("/api/auth", { credentials: "same-origin" });
        const auth = await authRes.json();
        if (!active) return;
        if (!auth.user) {
          router.replace("/login?next=/account");
          return;
        }
        setUser(auth.user);
        const [b, m] = await Promise.all([
          fetch("/api/bookings", { credentials: "same-origin" }).then((r) => r.json()),
          fetch("/api/messages", { credentials: "same-origin" }).then((r) => r.json()),
        ]);
        if (!active) return;
        setBookings(b.bookings ?? []);
        setMessages(m.messages ?? []);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-28 text-[var(--color-stone)] sm:px-6">
        <LoaderCircle size={18} className="animate-spin" /> Loading your account…
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[var(--color-green-dark)] pb-8">
        <div>
          <p className="micro text-[var(--color-marigold-ink)]">Your account</p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.2rem)] font-extrabold leading-[0.88]">
            Hello, {user?.name?.split(" ")[0] ?? "there"}.
          </h1>
          <p className="mt-3 text-[1.02rem] text-[var(--color-ink-soft)]">
            Signed in with your mobile number · requests and replies below
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={signOut}>
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2.5 font-display text-[1.9rem] font-bold leading-none">
            <CalendarCheck size={20} className="text-[var(--color-marigold-ink)]" />
            Your requests
          </h2>
          <div className="mt-5 space-y-4">
            {bookings.length === 0 && (
              <div className="border border-dashed border-[var(--color-rule)] px-5 py-8 text-sm text-[var(--color-stone)]">
                No requests yet.{" "}
                <Link href="/prebook" className="font-semibold underline underline-offset-4">
                  Pre-book a scooter
                </Link>{" "}
                or book a test ride.
              </div>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="border-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-[1.35rem] font-bold leading-none">
                    {b.scooterName ?? "Scooter enquiry"}
                  </h3>
                  <span className="micro text-[var(--color-stone)]">
                    {b.plan === "testride"
                      ? "Test ride"
                      : b.plan === "callback"
                        ? "Call back"
                        : "Pre-book"}
                  </span>
                  <span className="micro ml-auto text-[var(--color-stone)]">
                    {shortDate(b.createdAt)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="chip border-[var(--color-green-dark)] bg-[var(--color-paper)] text-[var(--color-green-dark)]">
                    {BOOKING_STATUS[b.status] ?? b.status}
                  </span>
                  {b.rideDate && (
                    <span className="num text-sm text-[var(--color-ink-soft)]">
                      Preferred date: {b.rideDate}
                    </span>
                  )}
                </div>
                {b.note && (
                  <p className="mt-3 border-l-4 border-[var(--color-rule)] pl-3 text-sm text-[var(--color-ink-soft)]">
                    {b.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2.5 font-display text-[1.9rem] font-bold leading-none">
            <MessageSquareText size={20} className="text-[var(--color-marigold-ink)]" />
            Messages & replies
          </h2>
          <div className="mt-5 space-y-4">
            {messages.length === 0 && (
              <div className="border border-dashed border-[var(--color-rule)] px-5 py-8 text-sm text-[var(--color-stone)]">
                No messages yet.{" "}
                <Link href="/#contact" className="font-semibold underline underline-offset-4">
                  Ask us anything
                </Link>
                .
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className="border-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] p-5">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="micro text-[var(--color-marigold-ink)]">{m.topic}</span>
                  <span className="micro ml-auto text-[var(--color-stone)]">
                    {shortDate(m.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-[0.98rem] leading-relaxed">{m.body}</p>
                {m.reply ? (
                  <div className="mt-4 border-l-4 border-[var(--color-green)] bg-[#eef4ef] px-4 py-3">
                    <p className="micro text-[var(--color-green)]">Azizi EV replied</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                      {m.reply}
                    </p>
                  </div>
                ) : (
                  <p className="micro mt-4 text-[var(--color-stone)]">
                    Waiting for the showroom to reply
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-2 border-[var(--color-green-dark)] bg-[var(--color-green)] p-6 text-[var(--color-paper)] sm:p-8">
        <p className="micro text-[var(--color-marigold)]">Need something right now?</p>
        <p className="mt-3 max-w-2xl font-display text-[1.85rem] font-bold leading-[1.05]">
          Call the showroom on 8058987070 — we would rather answer than have you wait for a
          reply.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="tel:+918058987070" className="btn btn-marigold">
            Call now
          </a>
          <Link href="/prebook" className="btn btn-ghost border-[var(--color-paper)] text-[var(--color-paper)]">
            Book a test ride
          </Link>
        </div>
      </div>
    </section>
  );
}
