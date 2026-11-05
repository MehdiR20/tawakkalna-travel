"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveDestinationAction } from "@/actions/admin";
import { button, Field, FormError, inputClass } from "@/components/ui";
import { dirOf, LOCALE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { CATEGORIES } from "@/lib/site";
import { useFormAction } from "@/lib/use-form-action";
import type { ActionState } from "@/lib/validation";

export type LocaleValues = {
  title: string;
  location: string;
  summary: string;
  description: string;
  included: string;
  excluded: string;
  itinerary: string;
};

export type DestinationFormValues = {
  id?: string;
  category: string;
  price: number | "";
  durationDays: number | "";
  startDate: string;
  endDate: string;
  capacity: number | "";
  images: string;
  published: boolean;
  featured: boolean;
  content: Record<Locale, LocaleValues>;
};

const initial: ActionState = {};

export function DestinationForm({ values }: { values: DestinationFormValues }) {
  const { t } = useI18n();
  const f = t.admin.form;
  const { state, onSubmit, pending } = useFormAction(saveDestinationAction, initial);
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  const localeHasError = (locale: Locale) => Object.keys(errors).some((key) => key.startsWith(`content.${locale}.`));

  // After a failed save, open the first language tab with a problem, since its
  // fields would otherwise be hidden.
  const [activeLocale, setActiveLocale] = useState<Locale>("ar");
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    const firstWithError = LOCALES.find(localeHasError);
    if (firstWithError) setActiveLocale(firstWithError);
  }

  const number = (name: "price" | "durationDays" | "capacity", label: string) => (
    <Field label={label} htmlFor={name} errors={errors[name]}>
      <input id={name} name={name} type="number" min={0} defaultValue={values[name]} aria-invalid={!!errors[name]} className={inputClass} />
    </Field>
  );

  const date = (name: "startDate" | "endDate", label: string) => (
    <Field label={label} htmlFor={name} errors={errors[name]}>
      <input id={name} name={name} type="date" defaultValue={values[name]} aria-invalid={!!errors[name]} className={inputClass} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <FormError message={state.error ?? (hasErrors ? f.fixFields : undefined)} />

      <Section title={f.basics}>
        <p className="text-sm text-muted">{f.contentHelp}</p>
        <div role="tablist" aria-label={f.languageTabs} className="flex flex-wrap gap-1 border-b border-line">
          {LOCALES.map((locale) => {
            const active = locale === activeLocale;
            return (
              <button
                key={locale}
                type="button"
                role="tab"
                id={`tab-${locale}`}
                aria-selected={active}
                aria-controls={`panel-${locale}`}
                onClick={() => setActiveLocale(locale)}
                className={`-mb-px flex min-h-11 cursor-pointer items-center gap-1.5 border-b-2 px-3 text-sm font-semibold transition-colors ${
                  active ? "border-forest-900 text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <span lang={locale}>{LOCALE_NAMES[locale]}</span>
                <span className="text-xs font-normal text-muted">({locale === "ar" ? f.required : f.optional})</span>
                {localeHasError(locale) && <AlertCircle role="img" aria-label={f.hasErrors} className="size-4 text-clay-600" />}
              </button>
            );
          })}
        </div>

        {/* Every panel stays in the DOM so all languages are submitted together. */}
        {LOCALES.map((locale) => (
          <div
            key={locale}
            role="tabpanel"
            id={`panel-${locale}`}
            aria-labelledby={`tab-${locale}`}
            hidden={locale !== activeLocale}
            dir={dirOf(locale)}
            lang={locale}
            className="space-y-5"
          >
            <LocalePanel locale={locale} values={values.content[locale]} errors={errors} />
          </div>
        ))}
      </Section>

      <Section title={f.settings}>
        <Field label={f.category} htmlFor="category" errors={errors.category}>
          <select id="category" name="category" defaultValue={values.category} aria-invalid={!!errors.category} className={`${inputClass} cursor-pointer`}>
            <option value="">{f.chooseCategory}</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t.categories[category]}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          {number("price", f.price(t.site.currencyCode))}
          {number("durationDays", f.duration)}
          {number("capacity", f.capacity)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {date("startDate", f.firstDeparture)}
          {date("endDate", f.lastDeparture)}
        </div>
      </Section>

      <Section title={f.photos}>
        <Field label={f.imageUrls} htmlFor="images" hint={f.imageHint} errors={errors.images}>
          <textarea id="images" name="images" rows={5} dir="ltr" defaultValue={values.images} aria-invalid={!!errors.images} className={inputClass} />
        </Field>
      </Section>

      <Section title={f.visibility}>
        <Check name="published" label={t.admin.published} hint={f.publishedHint} defaultChecked={values.published} />
        <Check name="featured" label={f.featured} hint={f.featuredHint} defaultChecked={values.featured} />
      </Section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={`${button.primary} cursor-pointer`}>
          {pending ? f.saving : values.id ? f.save : f.create}
        </button>
        <Link href="/admin/destinations" className={button.outline}>
          {t.common.cancel}
        </Link>
      </div>
    </form>
  );
}

function LocalePanel({
  locale,
  values,
  errors,
}: {
  locale: Locale;
  values: LocaleValues;
  errors: Record<string, string[] | undefined>;
}) {
  const f = useI18n().t.admin.form;
  const key = (name: keyof LocaleValues) => `content.${locale}.${name}`;

  const text = (name: keyof LocaleValues, label: string, hint?: string) => (
    <Field label={label} htmlFor={key(name)} hint={hint} errors={errors[key(name)]}>
      <input id={key(name)} name={key(name)} defaultValue={values[name]} aria-invalid={!!errors[key(name)]} className={inputClass} />
    </Field>
  );

  const area = (name: keyof LocaleValues, label: string, hint: string, rows: number) => (
    <Field label={label} htmlFor={key(name)} hint={hint} errors={errors[key(name)]}>
      <textarea id={key(name)} name={key(name)} rows={rows} defaultValue={values[name]} aria-invalid={!!errors[key(name)]} className={inputClass} />
    </Field>
  );

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {text("title", f.title)}
        {text("location", f.location, f.locationHint)}
      </div>
      {text("summary", f.summary, f.summaryHint)}
      {area("description", f.description, f.descriptionHint, 6)}
      <div className="grid gap-5 sm:grid-cols-2">
        {area("included", f.included, f.perLine, 6)}
        {area("excluded", f.excluded, f.perLine, 6)}
      </div>
      {area("itinerary", f.itinerary, f.itineraryHint, 7)}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-bold">{title}</h2>
      {children}
    </fieldset>
  );
}

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-forest-800" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
    </label>
  );
}
