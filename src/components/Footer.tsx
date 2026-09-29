import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { InstagramGlyph } from "@/components/Icons";
import { SITE } from "@/lib/format";

export default function Footer() {
  return (
    <footer className="grain mt-20 border-t-2 border-[var(--color-green-dark)] bg-[var(--color-green-dark)] text-[var(--color-paper)]">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="inline-block border-2 border-[var(--color-marigold)] px-3 py-2">
              <span className="micro text-[var(--color-marigold)]">Azizi EV · Sikar</span>
            </div>
            <p className="mt-5 max-w-sm font-display text-3xl font-bold leading-[0.95]">
              Electric scooters, sold with the stock board kept honest.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#cfd8cf]">
              The numbers on this site are the numbers on our showroom floor. If a scooter
              shows two units left, two units are standing here.
            </p>
          </div>

          <div>
            <p className="micro text-[var(--color-marigold)]">Visit / call</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-[var(--color-marigold)]" />
                <a href={`tel:+91${SITE.phone}`} className="num text-base">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 text-[var(--color-marigold)]">
                  <InstagramGlyph size={16} />
                </span>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all underline decoration-[var(--color-marigold)] underline-offset-4"
                >
                  @{SITE.instagramHandle}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-marigold)]" />
                <span className="text-[#cfd8cf]">{SITE.showroom}</span>
              </li>
              <li className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-[var(--color-marigold)]" />
                <span className="text-[#cfd8cf]">{SITE.hours}</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="micro text-[var(--color-marigold)]">On this site</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/#stock", label: "Live stock board" },
                { href: "/#scooters", label: "Scooters & prices" },
                { href: "/prebook", label: "Pre-book / test ride" },
                { href: "/#contact", label: "Message the showroom" },
                { href: "/account", label: "My account" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#cfd8cf] transition-colors hover:text-[var(--color-marigold)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/admin"
              className="micro mt-6 inline-block border border-[#5b6f66] px-3 py-2 text-[#9fb0a7] transition-colors hover:border-[var(--color-marigold)] hover:text-[var(--color-marigold)]"
            >
              Staff entry
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[#2c4b43] pt-6 text-xs text-[#9fb0a7] sm:flex-row sm:items-center sm:justify-between">
          <p className="num">
            © {new Date().getFullYear()} Azizi EV. Prices ex-showroom and subject to change.
          </p>
          <p className="micro">Stock updated by the showroom owner</p>
        </div>
      </div>
    </footer>
  );
}
