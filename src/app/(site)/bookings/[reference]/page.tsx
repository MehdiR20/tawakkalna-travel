import { CheckCircle2, MapPin, Phone, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { button } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SITE } from "@/lib/site";
import { tripContent } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.confirmation.metaTitle, robots: { index: false } };
}

export default async function BookingPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const user = await requireUser(`/bookings/${reference}`);
  const { locale, t } = await getI18n();
  const c = t.confirmation;

  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { destination: { select: { content: true } } },
  });
  // Same 404 for "doesn't exist" and "not yours", so short codes can't be probed.
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) notFound();

  const pending = booking.status === "PENDING";
  const trip = tripContent(booking.destination.content, locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="text-center">
        {pending && <CheckCircle2 aria-hidden className="mx-auto size-12 text-forest-700" />}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{pending ? c.reservedTitle : c.otherTitle}</h1>
        {pending && <p className="mt-2 text-muted">{c.reservedText}</p>}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="on-dark bg-forest-900 px-6 py-7 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/75 uppercase">{c.reference}</p>
          <p className="mt-2 text-4xl font-extrabold tracking-wider select-all" dir="ltr">
            {booking.reference}
          </p>
        </div>
        <dl className="divide-y divide-line px-6 text-sm">
          <Row label={c.status} value={<StatusBadge status={booking.status} full />} />
          <Row label={c.trip} value={[trip.title, trip.location].join(locale === "ar" ? "، " : ", ")} />
          <Row label={c.departure} value={formatDate(booking.travelDate, locale)} />
          <Row label={c.travelers} value={booking.travelers} />
          <Row
            label={pending ? t.booking.totalAtAgency : c.total}
            value={<span className="text-base font-extrabold whitespace-nowrap">{formatMoney(booking.totalPrice, locale)}</span>}
          />
        </dl>
      </div>

      {pending && (
        <section className="mt-6 rounded-2xl bg-clay-100 p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Store aria-hidden className="size-5 text-clay-700" /> {c.instructionsTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            {c.instructions1}
            <strong dir="ltr">{booking.reference}</strong>
            {c.instructions2}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2.5">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-700" />
              <a href={SITE.contact.mapUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {t.site.address}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-700" />
              <a href={SITE.contact.phoneHref} dir="ltr" className="underline">
                {SITE.contact.phone}
              </a>
            </li>
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/profile" className={button.forest}>
          {c.viewBookings}
        </Link>
        <Link href="/destinations" className={button.outline}>
          {c.browseMore}
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end font-medium">{value}</dd>
    </div>
  );
}
