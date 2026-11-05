import type { Prisma } from "@prisma/client";
import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { togglePublishedAction } from "@/actions/admin";
import { DeleteDestination } from "@/components/admin/delete-destination";
import { TripImage } from "@/components/trip-cards";
import { button, EmptyState, inputClass } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { asStringArray, formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { normalizeSearch, tripContent } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.manageMeta };
}

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  await requireAdmin();
  const { locale, t } = await getI18n();
  const a = t.admin;
  const raw = (await searchParams).q;
  const q = (typeof raw === "string" ? raw : "").trim().slice(0, 100);

  const where: Prisma.DestinationWhereInput = q ? { searchText: { contains: normalizeSearch(q) } } : {};
  const destinations = await prisma.destination.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  const headings = [a.colTrip, a.colCategory, a.colPrice, a.colDepartures, a.colBookings, a.colStatus, a.colActions];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">{a.destinations}</h1>
        <Link href="/admin/destinations/new" className={button.primary}>
          <Plus aria-hidden className="size-4" /> {a.addDestination}
        </Link>
      </div>

      <form action="/admin/destinations" role="search" className="mt-6 flex max-w-lg gap-2">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" type="search" defaultValue={q} aria-label={a.searchDestinations} placeholder={a.destinationsPlaceholder} className={`${inputClass} ps-10`} />
        </div>
        <button type="submit" className={`${button.forest} cursor-pointer`}>
          {t.common.search}
        </button>
      </form>

      <div className="mt-5">
        {destinations.length === 0 ? (
          <EmptyState title={a.noDestinations} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  {headings.map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 text-start font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {destinations.map((destination) => {
                  const content = tripContent(destination.content, locale);
                  return (
                    <tr key={destination.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TripImage src={asStringArray(destination.images)[0]} alt="" className="size-12 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="font-semibold">{content.title}</p>
                            <p className="text-xs text-muted">{content.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{t.categories[destination.category]}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatMoney(destination.price, locale)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted">
                        {a.dateRange(formatDate(destination.startDate, locale), formatDate(destination.endDate, locale))}
                      </td>
                      <td className="px-4 py-3">{destination._count.bookings}</td>
                      <td className="px-4 py-3">
                        <form action={togglePublishedAction}>
                          <input type="hidden" name="id" value={destination.id} />
                          <button
                            type="submit"
                            role="switch"
                            aria-checked={destination.published}
                            aria-label={a.publishedLabel(content.title)}
                            className={`inline-flex min-h-9 cursor-pointer items-center rounded-full px-3 text-xs font-semibold transition-colors ${
                              destination.published ? "bg-forest-100 text-forest-800 hover:bg-forest-100/70" : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                            }`}
                          >
                            {destination.published ? a.published : a.hidden}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1">
                          <Link href={`/admin/destinations/${destination.id}/edit`} className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-forest-50">
                            {a.edit}
                          </Link>
                          <DeleteDestination id={destination.id} title={content.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
