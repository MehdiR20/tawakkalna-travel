"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/actions/locale";
import { LOCALE_NAMES, LOCALE_SHORT, LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label={t.nav.language} className={`flex gap-0.5 ${pending ? "opacity-60" : ""}`}>
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[option]}
            disabled={pending}
            onClick={() => start(() => setLocaleAction(option))}
            className={`grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full px-2 text-xs font-semibold transition-colors ${
              active
                ? light
                  ? "bg-white/20 text-white"
                  : "bg-forest-100 text-forest-900"
                : light
                  ? "text-white/80 hover:text-white"
                  : "text-muted hover:text-ink"
            }`}
          >
            {LOCALE_SHORT[option]}
          </button>
        );
      })}
    </div>
  );
}
