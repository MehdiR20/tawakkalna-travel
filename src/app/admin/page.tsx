import { ArrowRight, CalendarCheck, Clock, MapPinned } from "lucide-react";
import Link from "next/link";
import { BookingTable } from "@/components/admin/booking-table";
import { flipRtl } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const { locale, t } = await getI18n();

  const [destinations, bookings, pending, recentPending] = await Promise.all([
    prisma.destination.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({ where: { status: "PENDING" }, _count: true, _sum: { totalPrice: true } }),
    prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        destination: { select: { id: true, content: true } },
      },
    }),
  ]);

  const cards = [
    { label: t.admin.totalDestinations, value: destinations, Icon: MapPinned, href: "/admin/destinations" },
    { label: t.admin.totalBookings, value: bookings, Icon: CalendarCheck, href: "/admin/bookings" },
    {
      label: t.admin.pendingPayments,
      value: pending._count,
      note: t.admin.toCollect(formatMoney(pending._sum.totalPrice ?? 0, locale)),
      Icon: Clock,
      href: "/admin/bookings?status=PENDING",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{t.admin.overview}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, note, Icon, href }) => (
          <Link key={label} href={href} className="rounded-2xl border border-line bg-white p-5 transition-colors hover:border-forest-700/40">
            <div className="flex items-center justify-between text-sm text-muted">
              {label}
              <Icon aria-hidden className="size-4 text-clay-600" />
            </div>
            <p className="mt-3 text-3xl font-extrabold">{value}</p>
            {note && <p className="mt-1 text-xs text-muted">{note}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{t.admin.latestPending}</h2>
        <Link href="/admin/bookings" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-clay-600 hover:text-clay-700">
          {t.admin.allReservations} <ArrowRight aria-hidden className={`size-4 ${flipRtl}`} />
        </Link>
      </div>
      <div className="mt-3">
        <BookingTable bookings={recentPending} />
      </div>
    </>
  );
}
