"use client";

import { button } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t.error.title}</h1>
        <p className="mt-2 text-muted">{t.error.text}</p>
        <button type="button" onClick={reset} className={`${button.primary} mt-6 cursor-pointer`}>
          {t.error.action}
        </button>
      </div>
    </main>
  );
}
