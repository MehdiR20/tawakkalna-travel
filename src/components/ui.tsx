import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const button = {
  primary: `${buttonBase} bg-clay-600 text-white hover:bg-clay-700`,
  forest: `${buttonBase} bg-forest-900 text-white hover:bg-forest-800`,
  outline: `${buttonBase} border border-line bg-white text-ink hover:border-forest-700 hover:text-forest-700`,
  ghostDark: `${buttonBase} border border-white/35 text-white hover:bg-white/10`,
};

export const inputClass =
  "block min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 transition-colors hover:border-muted/50 focus:border-forest-700 aria-[invalid=true]:border-clay-600 sm:text-sm";

/** Points arrows the way the text reads: they flip in right-to-left languages. */
export const flipRtl = "rtl:-scale-x-100";

export function Field({
  label,
  htmlFor,
  hint,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-clay-700">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-clay-100 px-4 py-3 text-sm text-clay-700">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${dark ? "text-clay-300" : "text-clay-600"}`}>
      {children}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}
