import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { listScooters } from "@/db/queries";
import { inr, STATUS_LABEL, SITE } from "@/lib/format";
import StockLedger from "@/components/StockLedger";
import InquiryForm from "@/components/InquiryForm";
import SafeImage from "@/components/SafeImage";
import { InstagramGlyph, BoltGlyph } from "@/components/Icons";

export const dynamic = "force-dynamic";

const REASONS = [
  {
    n: "01",
    title: "The stock board is the real one",
    body: "Counts are typed by us at the counter, not pulled from a catalogue. If it says one unit, one unit is standing on the floor today.",
  },
  {
    n: "02",
    title: "Free registration & delivery help",
    body: "Paperwork for high-speed models, RTO plate, insurance and home delivery within 40 km of the showroom — handled at the shop.",
  },
  {
    n: "03",
    title: "Finance from ₹1,999 a month",
    body: "Bajaj, HDB and local bank schemes available on selected models. Bring Aadhaar, PAN and a 3-month bank statement.",
  },
  {
    n: "04",
    title: "Battery warranty in writing",
    body: "1 to 3 year battery warranty depending on the model, plus free first-service and a paid-service plan after that.",
  },
];

export default async function HomePage() {
  const rows = await listScooters();
  const scooters = rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    variant: s.variant,
    price: s.price,
    rangeKm: s.rangeKm,
    topSpeed: s.topSpeed,
    battery: s.battery,
    charging: s.charging,
    colors: s.colors,
    units: s.units,
    status: s.status as "in_stock" | "low_stock" | "coming_soon",
    arrivalNote: s.arrivalNote,
  }));

  const available = scooters.filter((s) => s.status !== "coming_soon");
  const coming = scooters.filter((s) => s.status === "coming_soon");
  const totalUnits = available.reduce((sum, s) => sum + s.units, 0);
  const fromPrice = Math.min(...available.map((s) => s.price), Number.MAX_SAFE_INTEGER);
  const featured = rows.filter((s) => s.image).slice(0, 4);

  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative border-b-2 border-[var(--color-green-dark)]">
        <div className="mx-auto grid max-w-[1240px] lg:grid-cols-12">
          <div className="order-2 px-4 pb-14 pt-10 sm:px-6 lg:order-1 lg:col-span-7 lg:py-16">
            <div className="plate grain bg-[var(--color-paper-2)] p-6 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-marigold-ink)]">
                  <BoltGlyph size={16} />
                </span>
                <span className="micro text-[var(--color-marigold-ink)]">
                  Azizi EV · Sikar · live showroom stock
                </span>
              </div>

              <h1 className="mt-6 font-display text-[clamp(3.1rem,8.4vw,6.4rem)] font-extrabold leading-[0.86] tracking-[-0.035em]">
                Electric
                <br />
                scooters,
                <br />
                <span className="text-[var(--color-green)]">in stock</span>{" "}
                <span className="italic text-[var(--color-marigold-ink)]">today.</span>
              </h1>

              <p className="mt-6 max-w-lg text-[1.06rem] leading-relaxed text-[var(--color-ink-soft)]">
                This page is our showroom register — every model, its price and exactly how
                many units are standing on the floor right now. No “contact for price”, no
                guessing what is coming next.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#stock" className="btn btn-primary">
                  See the stock board <ArrowRight size={15} />
                </Link>
                <Link href="/prebook" className="btn btn-ghost">
                  Pre-book / test ride
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px border-2 border-[var(--color-green-dark)] bg-[var(--color-green-dark)] sm:grid-cols-4">
              {[
                { k: "Models listed", v: String(scooters.length) },
                { k: "Units on floor", v: String(totalUnits) },
                { k: "Scooters from", v: fromPrice === Number.MAX_SAFE_INTEGER ? "—" : inr(fromPrice) },
                { k: "Arriving next", v: String(coming.length) },
              ].map((stat) => (
                <div key={stat.k} className="bg-[var(--color-paper)] px-4 py-3">
                  <p className="num text-2xl font-semibold leading-none">{stat.v}</p>
                  <p className="micro mt-1.5 text-[var(--color-stone)]">{stat.k}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 min-h-[300px] overflow-hidden bg-[var(--color-green-dark)] lg:order-2 lg:col-span-5 lg:min-h-[640px] lg:mr-[calc(50%-50vw)]">
            <SafeImage
              src="images/showroom.jpg"
              alt="Azizi EV showroom floor with electric scooters lined up"
              className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
              eager
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-paper)] via-[rgba(244,239,228,0.18)] to-transparent lg:from-[var(--color-paper)] lg:via-transparent" />
            <div className="absolute bottom-4 right-4 border-2 border-[var(--color-marigold)] bg-[var(--color-green-dark)]/85 px-3 py-2">
              <p className="micro text-[var(--color-marigold)]">Showroom floor · today</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— STOCK BOARD ——— */}
      <section id="stock" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex flex-col gap-6 border-b-2 border-[var(--color-green-dark)] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="micro text-[var(--color-marigold-ink)]">The stock register</p>
              <h2 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[0.88]">
                What is standing
                <br />
                in the showroom.
              </h2>
            </div>
            <p className="max-w-sm text-[0.98rem] leading-relaxed text-[var(--color-ink-soft)]">
              Range and speed figures are the company-claimed numbers. Prices are
              ex-showroom; we will walk you through on-road cost, finance and delivery on
              call.
            </p>
          </div>

          <div className="mt-8">
            <StockLedger scooters={scooters} />
          </div>
        </div>
      </section>

      {/* ——— SCOOTERS MOSAIC ——— */}
      <section id="scooters" className="scroll-mt-20 border-y-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] py-16 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-xl font-display text-[clamp(2.3rem,5vw,3.8rem)] font-extrabold leading-[0.9]">
              The machines, up close.
            </h2>
            <Link href="/prebook" className="btn btn-ghost">
              Book a test ride <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-12">
            {featured.map((s, i) => (
              <Link
                key={s.id}
                href={`/scooters/${s.slug}`}
                className={`group relative block overflow-hidden border-2 border-[var(--color-green-dark)] bg-[var(--color-paper)] ${
                  i % 2 === 0 ? "md:col-span-7" : "md:col-span-5"
                }`}
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-[var(--color-paper-3)]">
                  <SafeImage
                    src={s.image}
                    alt={`${s.name} electric scooter`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,20,15,0.72)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5">
                    <div>
                      <h3 className="font-display text-[1.9rem] font-bold leading-none text-[var(--color-paper)]">
                        {s.name}
                      </h3>
                      <p className="micro mt-2 text-[#e6ddc9]">
                        {s.rangeKm} km range · {s.topSpeed} km/h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-xl font-semibold text-[var(--color-paper)]">
                        {inr(s.price)}
                      </p>
                      <span className={`chip chip-${s.status} mt-1.5`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— COMING NEXT ——— */}
      <section className="grain bg-[var(--color-green)] py-16 text-[var(--color-paper)] sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="micro text-[var(--color-marigold)]">Arriving next</p>
              <h2 className="mt-4 font-display text-[clamp(2.4rem,5.2vw,4rem)] font-extrabold leading-[0.9]">
                Not here yet.
                <br />
                Already bookable.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-[#cfe0d6]">
                We open a register before each lot reaches the showroom. Put your name down
                and you get the first call when the truck arrives — booking amount stays
                refundable until delivery day.
              </p>
              <Link href="/prebook" className="btn btn-marigold mt-7">
                Join the waiting list <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-[#2f6355] border-y border-[#2f6355]">
              {coming.map((s) => (
                <div key={s.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5">
                  <h3 className="font-display text-[1.85rem] font-bold leading-none">
                    {s.name}
                  </h3>
                  <p className="text-sm text-[#a9c3b6]">{s.variant}</p>
                  <p className="micro ml-auto text-[var(--color-marigold)]">
                    {s.arrivalNote ?? "Date to be confirmed"}
                  </p>
                  <p className="num w-full text-lg font-semibold sm:w-auto">{inr(s.price)}</p>
                </div>
              ))}
              {coming.length === 0 && (
                <p className="py-6 text-sm text-[#a9c3b6]">
                  Nothing announced right now — call us and we will tell you what is coming.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— WHY ——— */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="micro text-[var(--color-marigold-ink)]">Why buy from Azizi EV</p>
          <div className="mt-8 divide-y divide-[var(--color-rule)] border-y-2 border-[var(--color-green-dark)]">
            {REASONS.map((r) => (
              <div
                key={r.n}
                className="grid gap-4 py-7 md:grid-cols-[auto_1fr_1.3fr] md:items-baseline md:gap-10"
              >
                <span className="num text-[1.6rem] font-semibold text-[var(--color-marigold-ink)]">
                  {r.n}
                </span>
                <h3 className="font-display text-[1.75rem] font-bold leading-[1.02]">
                  {r.title}
                </h3>
                <p className="leading-relaxed text-[var(--color-ink-soft)]">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CONTACT ——— */}
      <section id="contact" className="scroll-mt-20 border-t-2 border-[var(--color-green-dark)] bg-[var(--color-paper-2)] py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="micro text-[var(--color-marigold-ink)]">Talk to the showroom</p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,5.2vw,3.9rem)] font-extrabold leading-[0.9]">
              Ask us anything
              <br />
              before you decide.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
              Send a message here, or reach us directly. We answer questions about
              availability, finance, exchange, service and delivery — even if you are still
              comparing.
            </p>

            <div className="relative mt-8 overflow-hidden border-2 border-[var(--color-green-dark)]">
              <SafeImage
                src="images/detail.jpg"
                alt="Close-up of an electric scooter instrument cluster and charging port"
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(8,48,42,0.72)] via-transparent to-transparent" />
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:+91${SITE.phone}`}
                className="flex items-center gap-3 border-2 border-[var(--color-green-dark)] bg-[var(--color-green)] px-4 py-3.5 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-green-dark)]"
              >
                <Phone size={18} />
                <span className="num text-lg font-semibold">{SITE.phoneDisplay}</span>
                <span className="micro ml-auto text-[#cfe0d6]">Call now</span>
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border-2 border-[var(--color-ink)] px-4 py-3.5 transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
              >
                <InstagramGlyph size={18} />
                <span className="num text-lg font-semibold">@{SITE.instagramHandle}</span>
                <span className="micro ml-auto opacity-70">DM us</span>
              </a>
            </div>
          </div>

          <div className="plate bg-[var(--color-paper)] p-6 sm:p-9">
            <h3 className="font-display text-[2rem] font-bold leading-none">
              Message the showroom
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Sign in with your mobile number first — it keeps your enquiry tied to your
              account so you can see our reply.
            </p>
            <div className="mt-7">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
