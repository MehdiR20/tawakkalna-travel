"use client";

import { Store } from "lucide-react";
import { useState } from "react";
import { createBookingAction } from "@/actions/bookings";
import { useI18n } from "@/i18n/provider";
import { formatMoney } from "@/lib/format";
import { useFormAction } from "@/lib/use-form-action";
import type { ActionState } from "@/lib/validation";
import { button, Field, FormError, inputClass } from "./ui";

const initial: ActionState = {};

export function BookingForm({
  destinationId,
  price,
  minDate,
  maxDate,
  maxTravelers,
}: {
  destinationId: string;
  price: number;
  minDate: string;
  maxDate: string;
  maxTravelers: number;
}) {
  const { locale, t } = useI18n();
  const { state, onSubmit, pending } = useFormAction(createBookingAction, initial);
  const [travelers, setTravelers] = useState(1);
  const errors = state.fieldErrors;
  const total = price * (Number.isFinite(travelers) ? Math.max(travelers, 0) : 0);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="destinationId" value={destinationId} />
      <FormError message={state.error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.booking.departureDate} htmlFor="travelDate" hint={t.booking.departureHint} errors={errors?.travelDate}>
          <input
            id="travelDate"
            name="travelDate"
            type="date"
            required
            min={minDate}
            max={maxDate}
            aria-invalid={!!errors?.travelDate}
            aria-describedby={errors?.travelDate ? "travelDate-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field label={t.booking.travelers} htmlFor="travelers" hint={t.booking.travelersHint(maxTravelers)} errors={errors?.travelers}>
          <input
            id="travelers"
            name="travelers"
            type="number"
            inputMode="numeric"
            required
            min={1}
            max={maxTravelers}
            value={Number.isNaN(travelers) ? "" : travelers}
            onChange={(e) => setTravelers(e.target.valueAsNumber)}
            aria-invalid={!!errors?.travelers}
            aria-describedby={errors?.travelers ? "travelers-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t.booking.notes} htmlFor="notes" hint={t.booking.notesHint} errors={errors?.notes}>
        <textarea id="notes" name="notes" rows={3} maxLength={500} className={inputClass} />
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-forest-50 px-4 py-3.5">
        <span className="text-sm font-medium">{t.booking.totalAtAgency}</span>
        <span className="text-xl font-extrabold whitespace-nowrap" aria-live="polite">
          {formatMoney(total, locale)}
        </span>
      </div>

      <p className="flex gap-2.5 text-sm leading-relaxed text-muted">
        <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-600" />
        {t.booking.noPayment}
      </p>

      <button type="submit" disabled={pending} className={`${button.primary} w-full cursor-pointer`}>
        {pending ? t.booking.submitting : t.booking.submit}
      </button>
    </form>
  );
}
