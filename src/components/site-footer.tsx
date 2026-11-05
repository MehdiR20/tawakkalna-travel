import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { CATEGORIES, SITE } from "@/lib/site";
import { Logo } from "./logo";

export async function SiteFooter() {
  const { t } = await getI18n();
  const { contact } = SITE;
  return (
    <footer id="contact" className="on-dark scroll-mt-20 bg-forest-950 text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1.4fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{t.site.tagline}</p>
          <h2 className="mt-5 text-sm font-semibold text-white">{t.footer.social}</h2>
          <ul className="mt-1 flex flex-wrap gap-x-5">
            {SITE.social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-white hover:text-clay-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{t.footer.trips}</h2>
          <ul className="mt-2">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/destinations?category=${category}`}
                  className="inline-flex min-h-10 items-center text-sm hover:text-white"
                >
                  {t.categories[category]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{t.footer.visit}</h2>
          <p className="mt-1 text-sm">{t.footer.visitNote}</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-300" />
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {t.site.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-300" />
              <a href={contact.phoneHref} dir="ltr" className="hover:text-white">
                {contact.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {t.site.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
