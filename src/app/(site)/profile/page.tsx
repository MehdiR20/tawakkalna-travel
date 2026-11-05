import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { TripImage } from "@/components/trip-cards";
import { button, EmptyState, Eyebrow } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";
import { getI18n } from "@/i18n/server";
import { asStringArray, formatDate, formatMoney, todayUtc } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { tripContent } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.profile.metaTitle, robots: { index: false } };
}

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const { locale, t } = await getI18n();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { destination: { select: { content: true, images: true } } },
    orderBy: { travelDate: "asc" },
  });

  const today = todayUtc();
  const isActive = (b: (typeof bookings)[number]) => b.status !== "CANCELLED" && b.travelDate >= today;
  const active = bookings.filter(isActive);
  const past = bookings.filter((b) => !isActive(b)).reverse();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <Eyebrow>{t.profile.eyebrow}</Eyebrow>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{t.profile.hello(user.name.split(" ")[0])}</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[17rem_1fr]">
        <aside>
          <section className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 className="font-bold">{t.profile.personal}</h2>
            <dl className="mt-4 space-y-3">
              <Info label={t.profile.fullName} value={user.name} />
              <Info label={t.profile.email} value={user.email} ltr />
              <Info label={t.profile.phone} value={user.phone ?? t.profile.notProvided} ltr={!!user.phone} />
              <Info label={t.profile.memberSince} value={formatDate(user.createdAt, locale)} />
            </dl>
          </section>
        </aside>

        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-xl font-bold">{t.profile.active}</h2>
            <div className="mt-4 space-y-3">
              {active.length ? (
                active.map((booking) => <BookingRow key={booking.id} booking={booking} locale={locale} t={t} />)
              ) : (
                <EmptyState title={t.profile.noActive}>
                  <Link href="/destinations" className={`${button.primary} mt-3`}>
                    {t.profile.findTrip}
                  </Link>
                </EmptyState>
              )}
            </div>
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">{t.profile.past}</h2>
              <div className="mt-4 space-y-3">
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} locale={locale} t={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium break-words">{ltr ? <bdi dir="ltr">{value}</bdi> : value}</dd>
    </div>
  );
}

type BookingRowData = {
  reference: string;
  travelDate: Date;
  travelers: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  destination: { content: unknown; images: unknown };
};

function BookingRow({ booking, locale, t }: { booking: BookingRowData; locale: Locale; t: Dict }) {
  const trip = tripContent(booking.destination.content, locale);
  return (
    <Link
      href={`/bookings/${booking.reference}`}
      className="flex gap-4 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-forest-700/40"
    >
      <TripImage src={asStringArray(booking.destination.images)[0]} alt="" className="size-20 shrink-0 rounded-xl sm:size-24" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-semibold">{trip.title}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {formatDate(booking.travelDate, locale)} · {t.common.travelers(booking.travelers)}
        </p>
        <p className="mt-1 text-sm">
          <bdi dir="ltr" className="font-mono font-semibold">
            {booking.reference}
          </bdi>
          <span className="text-muted"> · {formatMoney(booking.totalPrice, locale)}</span>
        </p>
      </div>
    </Link>
  );
}
