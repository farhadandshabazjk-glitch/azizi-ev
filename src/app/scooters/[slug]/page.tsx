import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { getScooter, listScooters } from "@/db/queries";
import { inr, STATUS_LABEL, SITE } from "@/lib/format";
import PrebookForm from "@/components/PrebookForm";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const rows = await listScooters();
  return rows.map((s) => ({ slug: s.slug }));
}

export default async function ScooterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scooter = await getScooter(slug);
  if (!scooter) notFound();

  const all = await listScooters();
  const models = all.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    variant: s.variant,
    status: s.status,
    price: s.price,
  }));

  const specs: { label: string; value: string }[] = [
    { label: "Riding range", value: `${scooter.rangeKm} km (claimed)` },
    { label: "Top speed", value: `${scooter.topSpeed} km/h` },
    { label: "Battery", value: scooter.battery ?? "—" },
    { label: "Charging time", value: scooter.charging ?? "—" },
    { label: "Motor", value: scooter.motor ?? "—" },
    { label: "Warranty", value: scooter.warranty ?? "—" },
    {
      label: "Licence / RTO",
      value:
        scooter.topSpeed <= 25
          ? "Not required (low-speed L1 category)"
          : "Required — we handle registration at the shop",
    },
    { label: "Colour options", value: scooter.colors ?? "—" },
    {
      label: "Showroom stock",
      value:
        scooter.status === "coming_soon"
          ? "Not arrived yet"
          : `${scooter.units} unit${scooter.units === 1 ? "" : "s"} standing today`,
    },
  ];

  return (
    <>
      <section className="border-b-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)]">
        <div className="mx-auto grid max-w-[1240px] gap-0 lg:grid-cols-12">
          <div className="order-2 px-4 py-12 sm:px-6 lg:order-1 lg:col-span-6 lg:py-16">
            <Link
              href="/#stock"
              className="micro inline-flex items-center gap-2 text-[var(--color-stone)] hover:text-[var(--color-marigold-ink)]"
            >
              <ArrowLeft size={14} /> Back to the stock board
            </Link>

            <h1 className="mt-6 font-display text-[clamp(3rem,7.4vw,5.6rem)] font-extrabold leading-[0.86]">
              {scooter.name}
            </h1>
            <p className="mt-3 text-lg text-[var(--color-ink-soft)]">{scooter.variant}</p>
            <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
              {scooter.tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div>
                <p className="num text-[2.6rem] font-semibold leading-none">
                  {inr(scooter.price)}
                </p>
                <p className="micro mt-2 text-[var(--color-stone)]">
                  ex-showroom · on-road on request
                </p>
              </div>
              <span className={`chip chip-${scooter.status}`}>{STATUS_LABEL[scooter.status]}</span>
            </div>

            {scooter.status === "coming_soon" && scooter.arrivalNote && (
              <p className="mt-5 border-l-4 border-[var(--color-marigold)] bg-[#fbf3e6] px-4 py-3 text-sm">
                {scooter.arrivalNote}. Pre-bookings are open — the booking amount stays
                refundable until delivery.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/prebook?model=${scooter.slug}`} className="btn btn-primary">
                {scooter.status === "coming_soon" ? "Join the waiting list" : "Pre-book this scooter"}
              </Link>
              <a href={`tel:+91${SITE.phone}`} className="btn btn-ghost">
                <Phone size={15} /> Call the showroom
              </a>
            </div>
          </div>

          <div className="relative order-1 min-h-[320px] overflow-hidden bg-[var(--color-green-dark)] lg:order-2 lg:col-span-6 lg:min-h-[560px]">
            {scooter.image ? (
              <SafeImage
                src={scooter.image}
                alt={`${scooter.name} electric scooter at the Azizi EV showroom`}
                className="absolute inset-0 h-full w-full object-cover"
                eager
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-green)] p-10">
                <p className="text-center font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.9] text-[var(--color-paper)]">
                  Photograph
                  <br />
                  coming with
                  <br />
                  <span className="text-[var(--color-marigold)]">the first lot.</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-[clamp(2.1rem,4.6vw,3.1rem)] font-extrabold leading-[0.92]">
            The specification
            <br />
            sheet.
          </h2>
          <div className="mt-8 border-t-2 border-[var(--color-green-dark)]">
            {specs.map((row) => (
              <div
                key={row.label}
                className="ledger-paper grid grid-cols-[1fr_1.35fr] items-baseline gap-4 border-b border-[var(--color-rule)] px-1 py-3.5"
              >
                <span className="micro text-[var(--color-stone)]">{row.label}</span>
                <span className="num text-[1.02rem] font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-display text-[1.9rem] font-bold leading-none">
            What it is like to ride
          </h3>
          <p className="mt-4 max-w-xl leading-relaxed text-[var(--color-ink-soft)]">
            {scooter.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {(scooter.colors ?? "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
              .map((colour) => (
                <span
                  key={colour}
                  className="chip border-[var(--color-rule)] text-[var(--color-ink-soft)]"
                >
                  {colour}
                </span>
              ))}
          </div>
        </div>

        <div className="plate h-fit bg-[var(--color-paper-2)] p-6 sm:p-8">
          <h3 className="font-display text-[1.9rem] font-bold leading-none">
            Book this one
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Requests reach us immediately. We call before taking any booking amount.
          </p>
          <div className="mt-6">
            <PrebookForm models={models} defaultSlug={scooter.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
