import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { TripImage } from "@/components/trip-cards";
import { button, EmptyState, Eyebrow, flipRtl } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { getSeatsLeft } from "@/lib/destinations";
import { asStringArray, formatDate, formatMoney, toDateInput, todayUtc } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { MAX_TRAVELERS_PER_BOOKING } from "@/lib/site";
import { tripContent } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.booking.metaTitle, robots: { index: false } };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/destinations/${id}/book`);
  const { locale, t } = await getI18n();

  const trip = await prisma.destination.findFirst({ where: { id, published: true } });
  if (!trip) notFound();

  const content = tripContent(trip.content, locale);
  const seatsLeft = await getSeatsLeft(trip.id, trip.capacity);
  const today = todayUtc();
  const firstDate = trip.startDate > today ? trip.startDate : today;
  const open = seatsLeft > 0 && trip.endDate >= today;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Link href={`/destinations/${trip.id}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft aria-hidden className={`size-4 ${flipRtl}`} /> {t.booking.back}
      </Link>
      <Eyebrow>{t.booking.eyebrow}</Eyebrow>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.booking.title}</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_17rem]">
        <div className="order-2 md:order-1">
          {open ? (
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
              <BookingForm
                destinationId={trip.id}
                price={trip.price}
                minDate={toDateInput(firstDate)}
                maxDate={toDateInput(trip.endDate)}
                maxTravelers={Math.min(seatsLeft, MAX_TRAVELERS_PER_BOOKING)}
              />
            </div>
          ) : (
            <EmptyState title={t.booking.unavailableTitle}>
              <p>{t.booking.unavailableText}</p>
              <Link href="/destinations" className={`${button.outline} mt-4`}>
                {t.booking.otherTrips}
              </Link>
            </EmptyState>
          )}
        </div>

        <aside className="order-1 md:order-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <TripImage src={asStringArray(trip.images)[0]} alt="" className="aspect-[16/10] w-full" />
            <div className="p-4 text-sm">
              <p className="font-semibold">{content.title}</p>
              <p className="text-muted">{content.location}</p>
              <dl className="mt-3 space-y-1.5 border-t border-line pt-3">
                <Row label={t.booking.price} value={`${formatMoney(trip.price, locale)} ${t.common.perPerson}`} />
                <Row label={t.booking.duration} value={t.common.days(trip.durationDays)} />
                <Row label={t.booking.firstDeparture} value={formatDate(firstDate, locale)} />
                <Row label={t.booking.lastDeparture} value={formatDate(trip.endDate, locale)} />
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end font-medium">{value}</dd>
    </div>
  );
}
