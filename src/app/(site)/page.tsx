import {
  ArrowRight,
  Banknote,
  Building2,
  ClipboardCheck,
  Headset,
  MapPin,
  ReceiptText,
  Search,
  Store,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";
import { DestinationTile, TripCard, TripImage } from "@/components/trip-cards";
import { button, Eyebrow, flipRtl } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/site";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=80";
const CTA_IMAGE =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80";

const VALUE_ICONS = [Banknote, ReceiptText, Building2, Headset];
const STEP_ICONS = [ClipboardCheck, TicketCheck, Store];

export default async function HomePage() {
  const { t } = await getI18n();
  const home = t.home;

  const trips = await prisma.destination.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    take: 7,
  });
  const destinationCount = await prisma.destination.count({ where: { published: true } });
  const tiles = trips.slice(0, 4);
  const cards = trips.slice(4, 7);

  return (
    <>
      {/* Hero */}
      <section className="on-dark relative isolate overflow-hidden bg-forest-950 text-white">
        {/* Dark while loading, so the white headline stays readable on slow connections. */}
        <TripImage src={HERO_IMAGE} alt="" eager width={2200} className="absolute inset-0 -z-20 size-full bg-forest-950!" />
        <div className="absolute inset-0 -z-10 from-forest-950/90 via-forest-950/70 to-forest-950/50 ltr:bg-gradient-to-r rtl:bg-gradient-to-l md:via-forest-950/55 md:to-forest-950/10" />
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-forest-950/60 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 pt-32 pb-14 sm:px-6 lg:px-8 lg:pt-40 lg:pb-20">
          <Eyebrow dark>{home.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            {home.titleLine1}
            <br />
            <span className="text-clay-300">{home.titleLine2}</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">{home.intro}</p>

          <form
            action="/destinations"
            role="search"
            className="mt-8 grid max-w-3xl gap-1 rounded-2xl bg-white p-2 text-ink shadow-soft sm:grid-cols-[1.4fr_1fr_auto] sm:rounded-full"
          >
            <label className="flex min-h-14 items-center gap-3 rounded-full px-4 transition-colors focus-within:bg-forest-50">
              <MapPin aria-hidden className="size-5 shrink-0 text-clay-600" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{home.whereTo}</span>
                <input
                  name="q"
                  placeholder={home.anyDestination}
                  className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted sm:text-sm"
                />
              </span>
            </label>
            <label className="flex min-h-14 items-center gap-3 rounded-full px-4 transition-colors focus-within:bg-forest-50 sm:rounded-none sm:border-s sm:border-line">
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{home.tripType}</span>
                <select name="category" className="w-full cursor-pointer bg-transparent text-base text-muted outline-none sm:text-sm">
                  <option value="">{home.allTrips}</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t.categories[category]}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <button type="submit" className={`${button.primary} min-h-14 cursor-pointer`}>
              <Search aria-hidden className="size-4" /> {t.common.search}
            </button>
          </form>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <HeroFact Icon={MapPin} value={t.common.trips(destinationCount)} label={home.openForBooking} />
            <HeroFact Icon={Banknote} value={home.noOnlinePayment} label={home.payAtOffice} />
          </dl>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[17rem_1fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <Eyebrow>{home.topEyebrow}</Eyebrow>
          <h2 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight">
            {home.topTitle1}
            <span className="text-clay-600">{home.topTitle2}</span>
          </h2>
          <p className="mt-3 text-muted">{home.topText}</p>
          <Link href="/destinations" className={`${button.outline} mt-6`}>
            {home.allDestinations} <ArrowRight aria-hidden className={`size-4 ${flipRtl}`} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((trip) => (
            <DestinationTile key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* More trips */}
      {cards.length > 0 && (
        <section className="on-dark bg-forest-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[17rem_1fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <Eyebrow dark>{home.upcomingEyebrow}</Eyebrow>
              <h2 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight">
                {home.upcomingTitle1}
                <span className="text-clay-300">{home.upcomingTitle2}</span>
              </h2>
              <p className="mt-3 text-white/75">{home.upcomingText}</p>
              <Link href="/destinations" className={`${button.ghostDark} mt-6`}>
                {home.viewAllTrips} <ArrowRight aria-hidden className={`size-4 ${flipRtl}`} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((trip) => (
                <TripCard key={trip.id} trip={trip} dark />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section id="why-us" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <Eyebrow>{home.whyEyebrow}</Eyebrow>
          <h2 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight">
            {home.whyTitle1}
            <span className="text-clay-600">{home.whyTitle2}</span>
          </h2>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {home.values.map(({ title, text }, index) => {
            const Icon = VALUE_ICONS[index];
            return (
              <li key={title} className="border-t border-line pt-6">
                <Icon aria-hidden className="size-6 text-clay-600" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How booking works */}
      <section id="how-it-works" className="on-dark scroll-mt-20 bg-forest-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Eyebrow dark>{home.howEyebrow}</Eyebrow>
          <h2 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight">
            {home.howTitle1}
            <span className="text-clay-300">{home.howTitle2}</span>
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {home.steps.map(({ title, text }, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <li key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <Icon aria-hidden className="size-6 text-clay-300" />
                    <span className="text-sm font-semibold text-white/60">{home.step(index + 1)}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative isolate overflow-hidden">
        <TripImage src={CTA_IMAGE} alt="" width={1600} className="absolute inset-0 -z-20 size-full" />
        <div className="absolute inset-0 -z-10 from-paper via-paper/90 to-paper/70 ltr:bg-gradient-to-r rtl:bg-gradient-to-l md:to-paper/10" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Eyebrow>{home.ctaEyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-md text-4xl leading-tight font-extrabold tracking-tight">
            {home.ctaTitle1}
            <span className="text-clay-600">{home.ctaTitle2}</span>
          </h2>
          <p className="mt-3 max-w-sm text-ink/80">{home.ctaText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/destinations" className={button.primary}>
              {home.browseTrips} <ArrowRight aria-hidden className={`size-4 ${flipRtl}`} />
            </Link>
            <a href="#contact" className={button.outline}>
              {home.contactUs}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroFact({ Icon, value, label }: { Icon: typeof MapPin; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon aria-hidden className="size-5 text-clay-300" />
      <div>
        <dt className="font-semibold">{value}</dt>
        <dd className="text-xs text-white/75">{label}</dd>
      </div>
    </div>
  );
}
