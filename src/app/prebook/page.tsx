import { redirect } from "next/navigation";
import { listScooters } from "@/db/queries";
import PrebookForm from "@/components/PrebookForm";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PrebookPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const params = await searchParams;
  const rows = await listScooters();
  const models = rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    variant: s.variant,
    status: s.status,
    price: s.price,
  }));
  if (models.length === 0) redirect("/");

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="micro text-[var(--color-marigold-ink)]">
            Pre-book · test ride · callback
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.7rem,6.4vw,4.8rem)] font-extrabold leading-[0.88]">
            Reserve your
            <br />
            scooter before
            <br />
            <span className="text-[var(--color-green)]">it sells out.</span>
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
            Our low-speed models need no licence or registration, so most customers ride out
            the same week. High-speed models need RTO paperwork — we handle that at the shop.
          </p>

          <div className="mt-9 border-t-2 border-[var(--color-green-dark)]">
            {models.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[var(--color-rule)] py-3.5"
              >
                <span className="font-display text-[1.35rem] font-bold leading-none">
                  {m.name}
                </span>
                <span className="text-sm text-[var(--color-stone)]">{m.variant}</span>
                <span className="num ml-auto text-base font-semibold">{inr(m.price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-l-4 border-[var(--color-marigold)] bg-[#fbf3e6] px-5 py-4">
            <p className="micro text-[var(--color-marigold-ink)]">Good to know</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Nothing is charged online. We call to confirm colour, finance and delivery
              date before any booking amount is taken — and it is refundable until delivery.
            </p>
          </div>
        </div>

        <div className="plate bg-[var(--color-paper-2)] p-6 sm:p-9">
          <h2 className="font-display text-[2.1rem] font-bold leading-none">
            Tell us what you need
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Fill this and it lands on our register instantly. We reply on call or WhatsApp.
          </p>
          <div className="mt-7">
            <PrebookForm models={models} defaultSlug={params.model} />
          </div>
        </div>
      </div>
    </section>
  );
}
