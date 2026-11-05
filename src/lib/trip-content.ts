// Relative imports: the seed script runs this file outside of Next.js.
import { LOCALES, type Locale } from "../i18n/config";

export type ItineraryItem = { title: string; description: string };

export type TripContent = {
  title: string;
  location: string;
  summary: string;
  description: string;
  included: string[];
  excluded: string[];
  itinerary: ItineraryItem[];
};

/** Stored in Destination.content. Arabic is always present; the rest are optional. */
export type TripTranslations = { ar: TripContent } & Partial<Record<Locale, TripContent>>;

const EMPTY: TripContent = {
  title: "",
  location: "",
  summary: "",
  description: "",
  included: [],
  excluded: [],
  itinerary: [],
};

/** The trip in the visitor's language, falling back to whichever translation exists. */
export function tripContent(content: unknown, locale: Locale): TripContent {
  const all = (content ?? {}) as Partial<Record<Locale, TripContent>>;
  const found = all[locale] ?? all.ar ?? LOCALES.map((l) => all[l]).find(Boolean);
  return { ...EMPTY, ...found };
}

/**
 * Makes search ignore case, French accents, Arabic vowel marks and common Arabic
 * spelling variants, so "beja" finds "Béjaïa" and "اسطنبول" finds "إسطنبول".
 */
export function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/** One searchable string across every language, stored in Destination.searchText. */
export function buildSearchText(content: Partial<Record<Locale, TripContent>>) {
  return normalizeSearch(
    LOCALES.flatMap((locale) => {
      const c = content[locale];
      return c ? [c.title, c.location, c.summary] : [];
    }).join(" "),
  );
}
