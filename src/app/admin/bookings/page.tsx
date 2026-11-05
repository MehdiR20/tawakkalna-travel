import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookingTable } from "@/components/admin/booking-table";
import { button, inputClass } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BOOKING_STATUSES, type BookingStatusKey } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.reservations };
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; q?: string | string[] }>;
}) {
  await requireAdmin();
  const { t } = await getI18n();
  const params = await searchParams;
  const status = BOOKING_STATUSES.find((s) => s === params.status);
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);

  const where: Prisma.BookingWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { reference: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q } } },
      ],
    }),
  };

  const [bookings, counts] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        destination: { select: { id: true, content: true } },
      },
    }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (key: BookingStatusKey) => counts.find((c) => c.status === key)?._count ?? 0;
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  const href = (key?: BookingStatusKey) => {
    const query = new URLSearchParams();
    if (key) query.set("status", key);
    if (q) query.set("q", q);
    const text = query.toString();
    return text ? `/admin/bookings?${text}` : "/admin/bookings";
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{t.admin.reservations}</h1>
      <p className="mt-1 text-sm text-muted">{t.admin.reservationsHelp}</p>

      <form action="/admin/bookings" role="search" className="mt-6 flex max-w-lg gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            aria-label={t.admin.searchReservations}
            placeholder={t.admin.reservationsPlaceholder}
            className={`${inputClass} ps-10`}
          />
        </div>
        <button type="submit" className={`${button.forest} cursor-pointer`}>
          {t.common.search}
        </button>
      </form>

      <nav aria-label={t.admin.filterStatus} className="mt-4 flex flex-wrap gap-2">
        <FilterPill href={href()} active={!status} label={t.admin.all} count={total} />
        {BOOKING_STATUSES.map((key) => (
          <FilterPill key={key} href={href(key)} active={status === key} label={t.status.short[key]} count={countFor(key)} />
        ))}
      </nav>

      <div className="mt-5">
        <BookingTable bookings={bookings} />
      </div>
    </>
  );
}

function FilterPill({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
        active ? "border-forest-900 bg-forest-900 text-white" : "border-line bg-white hover:border-forest-700"
      }`}
    >
      {label} <span className={active ? "text-white/75" : "text-muted"}>{count}</span>
    </Link>
  );
}
