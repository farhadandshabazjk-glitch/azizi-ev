"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { SITE } from "@/lib/format";

const TOPICS = [
  "Price & finance",
  "Stock availability",
  "Test ride booking",
  "Service & warranty",
  "Exchange / resale",
  "Something else",
];

export default function InquiryForm({ compact = false }: { compact?: boolean }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        setSignedIn(Boolean(d.user));
        if (d.user?.name) setName(d.user.name);
      })
      .catch(() => setSignedIn(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, topic, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not send your message. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
      setBody("");
    } catch {
      setError("Network problem — please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border-2 border-[var(--color-green)] bg-[#f0f6f1] p-7">
        <CircleCheck className="text-[var(--color-green)]" size={26} />
        <p className="mt-3 font-display text-2xl font-bold">Message received.</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          We reply on WhatsApp or a call, usually within the same working day. For anything
          urgent, call <span className="num font-semibold">{SITE.phoneDisplay}</span>.
        </p>
        <button
          type="button"
          className="btn btn-ghost mt-5"
          onClick={() => setState("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {signedIn === false && (
        <p className="border-l-4 border-[var(--color-marigold)] bg-[#fbf3e6] px-4 py-3 text-sm">
          Please{" "}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            sign in with your mobile number
          </Link>{" "}
          first — that way the showroom can reply to a real number and you can see our reply.
        </p>
      )}

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">Your name</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Imran Khan"
            required
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="micro mb-1.5 block text-[var(--color-stone)]">Mobile number</span>
          <input
            className="field num"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            inputMode="numeric"
            required
            maxLength={20}
          />
        </label>
      </div>

      <label className="block">
        <span className="micro mb-1.5 block text-[var(--color-stone)]">What is it about?</span>
        <select
          className="field"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="micro mb-1.5 block text-[var(--color-stone)]">Your question</span>
        <textarea
          className="field min-h-[130px] resize-y"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us which scooter you are looking at, your budget, or when you can visit…"
          required
          minLength={5}
          maxLength={1200}
        />
      </label>

      {error && (
        <p className="border-l-4 border-red-700 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          Send message
        </button>
        <a
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          WhatsApp instead
        </a>
      </div>
    </form>
  );
}
