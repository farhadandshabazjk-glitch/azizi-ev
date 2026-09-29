"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { SITE } from "@/lib/format";

type SessionUser = { id: string; name: string; role: string } | null;

const NAV = [
  { href: "/#stock", label: "Stock board" },
  { href: "/#scooters", label: "Scooters" },
  { href: "/prebook", label: "Pre-book" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [user, setUser] = useState<SessionUser>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (active) setUser(d.user ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-green-dark)] bg-[var(--color-paper)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Azizi EV home">
          <span className="flex h-9 w-9 items-center justify-center border-2 border-[var(--color-green-dark)] bg-[var(--color-green)] font-display text-lg font-extrabold text-[var(--color-paper)]">
            A
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-extrabold tracking-tight">
              AZIZI EV
            </span>
            <span className="micro block text-[var(--color-stone)]">
              Electric showroom
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="micro text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-marigold-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href={`tel:+91${SITE.phone}`}
          className="ml-auto hidden items-center gap-2 border-2 border-[var(--color-green-dark)] bg-[var(--color-green)] px-3 py-2 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-green-dark)] md:ml-0 md:flex"
        >
          <Phone size={15} strokeWidth={2.4} />
          <span className="num text-sm font-semibold">{SITE.phoneDisplay}</span>
        </a>

        <Link
          href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
          className="micro border-2 border-[var(--color-ink)] px-3 py-2 transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          {user ? user.name.split(" ")[0] : "Sign in"}
        </Link>

        <button
          type="button"
          className="border-2 border-[var(--color-ink)] p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="micro border-b border-[var(--color-rule)] pb-2 text-[var(--color-ink-soft)]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:+91${SITE.phone}`}
              className="num flex items-center gap-2 text-base font-semibold text-[var(--color-green)]"
            >
              <Phone size={16} /> {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
