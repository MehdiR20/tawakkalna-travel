import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Destination } from "@prisma/client";
import { getI18n } from "@/i18n/server";
import { asStringArray, formatMoney } from "@/lib/format";
import { tripContent } from "@/lib/trip-content";
import { flipRtl } from "./ui";

/** Unsplash resizes on request, so small cards don't need to download full-size photos. */
function sizedUrl(src: string, width: number) {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  return url.toString();
}

/**
 * Plain <img> because these URLs are admin-entered and can be on any host:
 * next/image would need either an allow-list that breaks new hosts or a wildcard
 * that turns the optimizer into an open proxy.
 */
export function TripImage({
  src,
  alt,
  className = "",
  eager = false,
  width = 800,
}: {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  width?: number;
}) {
  if (!src) return <div className={`bg-forest-100 ${className}`} />;
  return (
    <img
      src={sizedUrl(src, width)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`bg-forest-100 object-cover ${className}`}
    />
  );
}

/** Tall photo tile with the title over the image. */
export async function DestinationTile({ trip }: { trip: Destination }) {
  const { locale } = await getI18n();
  const content = tripContent(trip.content, locale);
  return (
    <Link
      href={`/destinations/${trip.id}`}
      className="on-dark group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-soft"
    >
      <TripImage
        src={asStringArray(trip.images)[0]}
        alt=""
        className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
        <div className="min-w-0">
          <p className="font-semibold">{content.title}</p>
          <p className="truncate text-xs text-white/80">{content.location}</p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-forest-900 transition-transform group-hover:-translate-y-0.5">
          <ArrowUpRight aria-hidden className={`size-4 ${flipRtl}`} />
        </span>
      </div>
    </Link>
  );
}

/** Photo above, trip facts and price below. */
export async function TripCard({ trip, dark = false }: { trip: Destination; dark?: boolean }) {
  const { locale, t } = await getI18n();
  const content = tripContent(trip.content, locale);
  return (
    <Link
      href={`/destinations/${trip.id}`}
      className={`group flex h-full flex-col rounded-2xl border p-2.5 transition-colors ${
        dark
          ? "on-dark border-white/15 bg-white/5 text-white hover:border-white/40"
          : "border-line bg-white shadow-soft hover:border-forest-700/40"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <TripImage
          src={asStringArray(trip.images)[0]}
          alt=""
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute start-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest-900">
          {t.categories[trip.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-2.5 pt-3.5">
        <h3 className="font-semibold">{content.title}</h3>
        <p className={`mt-0.5 text-sm ${dark ? "text-white/70" : "text-muted"}`}>{content.location}</p>
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${dark ? "text-white/70" : "text-muted"}`}>
          <CalendarDays aria-hidden className="size-3.5" /> {t.common.days(trip.durationDays)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p>
            <span className="text-lg font-bold">{formatMoney(trip.price, locale)}</span>
            <span className={`text-xs ${dark ? "text-white/70" : "text-muted"}`}> {t.common.perPerson}</span>
          </p>
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
              dark ? "bg-white text-forest-900" : "bg-forest-50 text-forest-900 group-hover:bg-forest-900 group-hover:text-white"
            }`}
          >
            <ArrowUpRight aria-hidden className={`size-4 ${flipRtl}`} />
          </span>
        </div>
      </div>
    </Link>
  );
}
