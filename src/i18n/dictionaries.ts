import type { Locale } from "./config";
import ar from "./ar";
import en from "./en";
import fr from "./fr";

export type Dict = typeof en;

const DICTIONARIES: Record<Locale, Dict> = { ar, fr, en };

export const getDictionary = (locale: Locale) => DICTIONARIES[locale];
