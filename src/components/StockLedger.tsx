"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { inr, STATUS_LABEL } from "@/lib/format";

export type LedgerScooter = {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  price: number;
  rangeKm: number;
  topSpeed: number;
  battery: string | null;
  charging: string | null;
  colors: string | null;
  units: number;
  status: "in_stock" | "low_stock" | "coming_soon";
  arrivalNote: string | null;
};

type Filter = "all" | "available" | "coming";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All stock" },
  { key: "available", label: "Standing in showroom" },
  { key: "coming", label: "Arriving next" },
];

function Ticks({ units, status }: { units: number; status: string }) {
  const shown = Math.min(units, 12);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={
              i < shown
                ? `tick ${status === "coming_soon" ? "opacity-30" : ""}`
                : "tick tick-empty"
            }
          />
        ))}
      </div>
      <span className="num text-sm font-semibold">
        {status === "coming_soon" ? "—" : units}
        <span className="ml-1 text-[var(--color-stone)]">
          {status === "coming_soon" ? "" : units === 1 ? "unit" : "units"}
        </span>
      </span>
    </div>
  );
}

export default function StockLedger({ scooters }: { scooters: LedgerScooter[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const reduce = useReducedMotion();

  const rows = useMemo(() => {
    if (filter === "available") return scooters.filter((s) => s.status !== "coming_soon");
    if (filter === "coming") return scooters.filter((s) => s.status === "coming_soon");
    return scooters;
  }, [scooters, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`micro border-2 px-3.5 py-2 transition-colors ${
                active
                  ? "border-[var(--color-green-dark)] bg-[var(--color-green)] text-[var(--color-paper)]"
                  : "border-[var(--color-rule)] text-[var(--color-ink-soft)] hover:border-[var(--color-green)]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
        <p className="micro ml-auto text-[var(--color-stone)]">
          {rows.length} model{rows.length === 1 ? "" : "s"} listed
        </p>
      </div>

      <div className="mt-5 border-2 border-[var(--color-green-dark)] bg-[var(--color-paper)]">
        {/* column header — desktop only */}
        <div className="hidden grid-cols-[3.1fr_1fr_1fr_1.5fr_1.8fr_1.3fr_1.2fr] items-end gap-4 border-b-2 border-[var(--color-green-dark)] bg-[var(--color-green)] px-5 py-3 text-[var(--color-paper)] lg:grid">
          <span className="micro">Model / variant</span>
          <span className="micro text-right">Range</span>
          <span className="micro text-right">Top speed</span>
          <span className="micro text-right">Price</span>
          <span className="micro">Showroom floor</span>
          <span className="micro">Status</span>
          <span className="micro text-right">Action</span>
        </div>

        <div className="divide-y divide-[var(--color-rule)]">
          {rows.map((s, index) => (
            <motion.div
              key={s.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: index * 0.028, ease: [0.22, 1, 0.36, 1] }}
              className="row-hover ledger-paper grid grid-cols-2 gap-x-5 gap-y-3 px-5 py-5 lg:grid-cols-[3.1fr_1fr_1fr_1.5fr_1.8fr_1.3fr_1.2fr] lg:items-center lg:gap-4"
            >
              <div className="col-span-2 lg:col-span-1">
                <Link
                  href={`/scooters/${s.slug}`}
                  className="group inline-flex items-baseline gap-2"
                >
                  <h3 className="font-display text-[1.65rem] font-bold leading-none">
                    {s.name}
                  </h3>
                  <ArrowUpRight
                    size={16}
                    className="translate-y-[2px] text-[var(--color-marigold-ink)] opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
                <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{s.variant}</p>
                {s.status === "coming_soon" && s.arrivalNote && (
                  <p className="micro mt-2 text-[var(--color-marigold-ink)]">{s.arrivalNote}</p>
                )}
              </div>

              <div>
                <span className="micro block text-[var(--color-stone)] lg:hidden">Range</span>
                <span className="num text-lg font-semibold">{s.rangeKm}</span>
                <span className="ml-1 text-sm text-[var(--color-stone)]">km</span>
              </div>

              <div>
                <span className="micro block text-[var(--color-stone)] lg:hidden">Top speed</span>
                <span className="num text-lg font-semibold">{s.topSpeed}</span>
                <span className="ml-1 text-sm text-[var(--color-stone)]">km/h</span>
              </div>

              <div>
                <span className="micro block text-[var(--color-stone)] lg:hidden">Price</span>
                <span className="num text-xl font-semibold">{inr(s.price)}</span>
                <span className="micro block text-[var(--color-stone)]">ex-showroom</span>
              </div>

              <div>
                <span className="micro mb-1 block text-[var(--color-stone)] lg:hidden">
                  Showroom floor
                </span>
                <Ticks units={s.units} status={s.status} />
              </div>

              <div>
                <span className={`chip chip-${s.status}`}>{STATUS_LABEL[s.status]}</span>
              </div>

              <div className="col-span-2 flex gap-2 lg:col-span-1 lg:justify-end">
                <Link
                  href={`/prebook?model=${s.slug}`}
                  className="btn btn-primary px-3 py-2 text-[0.68rem]"
                >
                  {s.status === "coming_soon" ? "Notify me" : "Pre-book"}
                </Link>
              </div>
            </motion.div>
          ))}

          {rows.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--color-stone)]">
              Nothing in this view right now — check the other tabs.
            </div>
          )}
        </div>
      </div>

      <p className="micro mt-3 text-[var(--color-stone)]">
        Stock counts are entered by the showroom owner · updated live on this page
      </p>
    </div>
  );
}
