import { ArrowLeft, CalendarRange, Check, Clock, Store, Users, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Gallery } from "@/components/gallery";
import { button, Eyebrow, flipRtl } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { getSeatsLeft } from "@/lib/destinations";
import { asStringArray, formatDate, formatMoney, todayUtc } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { tripContent } from "@/lib/trip-content";

type Params = Promise<{ id: string }>;

const getTrip = cache((id: string) => prisma.destination.findFirst({ where: { id, published: true } }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const trip = await getTrip((await params).id);
  if (!trip) return {};
  const { locale } = await getI18n();
  const content = tripContent(trip.content, locale);
  return { title: content.title, description: content.summary };
}

export default async function DestinationPage({ params }: { params: Params }) {
  const trip = await getTrip((await params).id);
  if (!trip) notFound();

  const { locale, t } = await getI18n();
  const content = tripContent(trip.content, locale);
  const seatsLeft = await getSeatsLeft(trip.id, trip.capacity);
  const closed = trip.endDate < todayUtc();
  const bookable = seatsLeft > 0 && !closed;
  const unavailableLabel = closed ? t.trip.bookingClosed : t.trip.fullyBooked;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/destinations" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft aria-hidden className={`size-4 ${flipRtl}`} /> {t.trip.allDestinations}
      </Link>

      <div className="mt-2">
        <Gallery images={asStringArray(trip.images)} title={content.title} />
      </div>

      <div className="mt-8 grid gap-10 pb-20 lg:grid-cols-[1fr_22rem] lg:pb-8">
        <div className="min-w-0">
          <Eyebrow>{t.categories[trip.category]}</Eyebrow>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-2 text-lg text-muted">{content.location}</p>
          <p className="mt-6 leading-relaxed whitespace-pre-line text-ink/85">{content.description}</p>

          {(content.included.length > 0 || content.excluded.length > 0) && (
            <section className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
              <ServiceList title={t.trip.included} items={content.included} Icon={Check} iconClass="text-forest-700" />
              <ServiceList title={t.trip.excluded} items={content.excluded} Icon={X} iconClass="text-clay-600" />
            </section>
          )}

          {content.itinerary.length > 0 && (
            <section className="mt-12 border-t border-line pt-10">
              <h2 className="text-2xl font-bold tracking-tight">{t.trip.itinerary}</h2>
              <ol className="mt-6">
                {content.itinerary.map((step, index) => (
                  <li key={index} className="relative flex gap-4 pb-8 last:pb-0">
                    {index < content.itinerary.length - 1 && (
                      <span aria-hidden className="absolute start-[0.9375rem] top-8 bottom-0 w-px bg-line" />
                    )}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      {step.description && <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <p>
              <span className="text-3xl font-extrabold">{formatMoney(trip.price, locale)}</span>
              <span className="text-sm text-muted"> {t.common.perPerson}</span>
            </p>
            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <Fact Icon={Clock} label={t.trip.duration} value={t.common.days(trip.durationDays)} />
              <Fact Icon={CalendarRange} label={t.trip.departures} value={`${formatDate(trip.startDate, locale)} – ${formatDate(trip.endDate, locale)}`} />
              <Fact Icon={Users} label={t.trip.availability} value={t.trip.seatsLeft(seatsLeft)} />
            </dl>
            <div className="mt-6 hidden lg:block">
              {bookable ? (
                <Link href={`/destinations/${trip.id}/book`} className={`${button.primary} w-full`}>
                  {t.trip.bookNow}
                </Link>
              ) : (
                <p className="rounded-full bg-stone-200 px-4 py-3 text-center text-sm font-semibold text-stone-700">{unavailableLabel}</p>
              )}
            </div>
            <p className="mt-4 flex gap-2.5 text-xs leading-relaxed text-muted">
              <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-600" />
              {t.trip.payNote}
            </p>
          </div>
        </aside>
      </div>

      {/* Keeps the action within reach on phones, where the summary card scrolls away. */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <p>
          <span className="text-lg font-extrabold">{formatMoney(trip.price, locale)}</span>
          <span className="text-xs text-muted"> {t.common.perPerson}</span>
        </p>
        {bookable ? (
          <Link href={`/destinations/${trip.id}/book`} className={button.primary}>
            {t.trip.bookNow}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-stone-700">{unavailableLabel}</p>
        )}
      </div>
    </div>
  );
}

function ServiceList({ title, items, Icon, iconClass }: { title: string; items: string[]; Icon: typeof Check; iconClass: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-600" />
      <div>
        <dt className="text-muted">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </div>
  );
}
