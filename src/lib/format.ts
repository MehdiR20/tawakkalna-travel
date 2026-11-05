import { INTL_TAGS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export function formatMoney(amount: number, locale: Locale) {
  const number = new Intl.NumberFormat(INTL_TAGS[locale], { maximumFractionDigits: 0 }).format(amount);
  return `${number} ${getDictionary(locale).site.currency}`;
}

// Calendar dates are stored as UTC midnight, so they must also be read as UTC
// or they shift by a day for visitors west of Greenwich.
export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(INTL_TAGS[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
export const parseDateInput = (value: string) => new Date(`${value}T00:00:00.000Z`);

export function todayUtc() {
  return parseDateInput(new Date().toISOString().slice(0, 10));
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
