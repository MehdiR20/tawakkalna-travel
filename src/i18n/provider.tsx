"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";

const I18nContext = createContext<Locale>("ar");

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const locale = useContext(I18nContext);
  return { locale, t: getDictionary(locale) };
}
