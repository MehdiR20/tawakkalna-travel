export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ar: "عربي",
  fr: "FR",
  en: "EN",
};

// ar-DZ gives Western digits and the month names used in Algeria (جانفي, فيفري...).
export const INTL_TAGS: Record<Locale, string> = {
  ar: "ar-DZ",
  fr: "fr-DZ",
  en: "en-GB",
};

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);
export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
