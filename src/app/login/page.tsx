"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { SITE } from "@/lib/format";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1100px] px-4 py-24 text-[var(--color-stone)] sm:px-6">
          Loading…
        </div>
      }
    >
      <LoginPanel />
    </Suspense>
  );
}

function LoginPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name,
          phone,
          city,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign you in. Please try again.");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-[1100px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
      <div>
        <p className="micro text-[var(--color-marigold-ink)]">Customer sign-in</p>
        <h1 className="mt-4 font-display text-[clamp(2.7rem,6vw,4.4rem)] font-extrabold leading-[0.88]">
          Your mobile
          <br />
          number is your
          <br />
          <span className="text-[var(--color-green)]">account.</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
          No email, no OTP wait. Register once with your mobile number and password, and you
          can pre-book scooters, ask questions and track our replies from one place.
        </p>

        <ul className="mt-8 space-y-3 border-t-2 border-[var(--color-green-dark)] pt-6">
          {[
            "Pre-book a unit or book a test ride",
            "See your requests and our replies",
            "Your number stays private — never shown publicly",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[0.98rem]">
              <span className="mt-[7px] h-2.5 w-2.5 shrink-0 bg-[var(--color-marigold)]" />
              {item}
            </li>
          ))}
        </ul>

        <p className="micro mt-8 text-[var(--color-stone)]">
          Prefer to talk? {SITE.phoneDisplay}
        </p>
      </div>

      <div className="plate bg-[var(--color-paper-2)] p-6 sm:p-9">
        <div className="flex gap-2">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`micro flex-1 border-2 px-3 py-2.5 transition-colors ${
                mode === m
                  ? "border-[var(--color-green-dark)] bg-[var(--color-green)] text-[var(--color-paper)]"
                  : "border-[var(--color-rule)] hover:border-[var(--color-green)]"
              }`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="micro mb-1.5 block text-[var(--color-stone)]">Full name</span>
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Your name"
              />
            </label>
          )}

          <label className="block">
            <span className="micro mb-1.5 block text-[var(--color-stone)]">Mobile number</span>
            <input
              className="field num"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={20}
              inputMode="numeric"
              placeholder="10-digit mobile number"
            />
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="micro mb-1.5 block text-[var(--color-stone)]">
                City / village (optional)
              </span>
              <input
                className="field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={60}
                placeholder="e.g. Sikar"
              />
            </label>
          )}

          <label className="block">
            <span className="micro mb-1.5 block text-[var(--color-stone)]">Password</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={72}
              placeholder="At least 6 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error && (
            <p className="border-l-4 border-red-700 bg-red-50 px-4 py-2.5 text-sm text-red-800">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : mode === "login" ? (
              <LogIn size={15} />
            ) : (
              <UserPlus size={15} />
            )}
            {mode === "login" ? "Sign in" : "Create my account"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-[var(--color-stone)]">
          Passwords are stored salted and hashed. Sessions expire automatically. We never
          show your number on the site and never ask for OTP or bank details.
        </p>

        <p className="mt-4 text-sm">
          Are you the showroom owner?{" "}
          <Link
            href="/admin"
            className="font-semibold underline decoration-[var(--color-marigold)] underline-offset-4"
          >
            Staff entry
          </Link>
        </p>
      </div>
    </section>
  );
}
