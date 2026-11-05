import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TripCard } from "@/components/trip-cards";
import { button, EmptyState, Eyebrow, inputClass } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, type CategoryKey } from "@/lib/site";
import { normalizeSearch } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.catalog.metaTitle };
}

type SearchParams = Promise<{ q?: string | string[]; category?: string | string[] }>;

export default async function DestinationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getI18n();
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const category = CATEGORIES.find((c) => c === params.category);

  const where: Prisma.DestinationWhereInput = {
    published: true,
    ...(category && { category }),
    ...(q && { searchText: { contains: normalizeSearch(q) } }),
  };
  const trips = await prisma.destination.findMany({ where, orderBy: { startDate: "asc" } });

  const pillHref = (key?: CategoryKey) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (key) query.set("category", key);
    const text = query.toString();
    return text ? `/destinations?${text}` : "/destinations";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Eyebrow>{t.catalog.eyebrow}</Eyebrow>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{t.catalog.title}</h1>

      <form action="/destinations" role="search" className="mt-7 flex max-w-xl gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t.catalog.placeholder}
            aria-label={t.catalog.searchLabel}
            className={`${inputClass} rounded-full ps-10`}
          />
        </div>
        <button type="submit" className={`${button.forest} cursor-pointer`}>
          {t.common.search}
        </button>
      </form>

      <nav aria-label={t.catalog.filterLabel} className="mt-5 flex flex-wrap gap-2">
        <Pill href={pillHref()} active={!category}>
          {t.home.allTrips}
        </Pill>
        {CATEGORIES.map((key) => (
          <Pill key={key} href={pillHref(key)} active={category === key}>
            {t.categories[key]}
          </Pill>
        ))}
      </nav>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {t.catalog.found(trips.length)}
      </p>

      {trips.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title={t.catalog.emptyTitle}>
            <Link href="/destinations" className="font-semibold text-clay-600 underline">
              {t.catalog.clear}
            </Link>
          </EmptyState>
        </div>
      )}
    </div>
  );
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
        active ? "border-forest-900 bg-forest-900 text-white" : "border-line bg-white text-ink hover:border-forest-700"
      }`}
    >
      {children}
    </Link>
  );
}
