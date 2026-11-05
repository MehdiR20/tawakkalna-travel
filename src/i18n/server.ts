import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";
import { getDictionary } from "./dictionaries";

/** The visitor's language, from their cookie. Arabic unless they chose otherwise. */
export const getI18n = cache(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  return { locale, t: getDictionary(locale) };
});
