import { z } from "zod";
import type { Dict } from "@/i18n/dictionaries";
import { CATEGORIES, MAX_TRAVELERS_PER_BOOKING } from "./site";

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Schema messages are keys into the `errors` dictionary, translated in fieldErrors(). */
type ErrorKey = keyof Dict["errors"];
const msg = (key: ErrorKey) => key;

export const idSchema = z.cuid();

const email = z.string().trim().toLowerCase().pipe(z.email(msg("emailInvalid")).max(254, msg("tooLong")));

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};
const dateString = z
  .string(msg("dateRequired"))
  .regex(/^\d{4}-\d{2}-\d{2}$/, msg("dateRequired"))
  .refine(isRealDate, msg("dateInvalid"));

// Number("") is 0, so a blank field must be rejected before coercion.
const wholeNumber = (key: ErrorKey) =>
  z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number(msg(key)).int(msg("wholeNumber")));

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, msg("nameRequired")).max(80, msg("tooLong")),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{5,24}$/, msg("phoneInvalid"))
    .optional()
    .or(z.literal("").transform(() => undefined)),
  // bcrypt only reads the first 72 bytes, so longer passwords are refused.
  password: z
    .string()
    .min(8, msg("passwordShort"))
    .refine((v) => new TextEncoder().encode(v).length <= 72, msg("passwordLong")),
});

export const bookingSchema = z.object({
  destinationId: idSchema,
  travelDate: dateString,
  travelers: wholeNumber("travelersRequired").pipe(
    z.number().min(1, msg("travelersMin")).max(MAX_TRAVELERS_PER_BOOKING, msg("travelersMax")),
  ),
  notes: z.string().trim().max(500, msg("notesLong")).optional(),
});

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

// https only: these values end up in <img src>, and this rules out javascript:,
// data: and mixed-content URLs.
const httpsUrl = z.url(msg("imagesHttps")).refine((url) => url.startsWith("https://"), msg("imagesHttps"));

const contentFields = z.object({
  title: z.string().trim().max(120, msg("tooLong")),
  location: z.string().trim().max(120, msg("tooLong")),
  summary: z.string().trim().max(200, msg("tooLong")),
  description: z.string().trim().max(5000, msg("tooLong")),
  included: z.string().transform(lines).pipe(z.array(z.string().max(200, msg("tooLong"))).max(40, msg("tooLong"))),
  excluded: z.string().transform(lines).pipe(z.array(z.string().max(200, msg("tooLong"))).max(40, msg("tooLong"))),
  itinerary: z
    .string()
    .transform((text) =>
      lines(text).map((line) => {
        const [title, ...rest] = line.split("|");
        return { title: title.trim(), description: rest.join("|").trim() };
      }),
    )
    .pipe(
      z
        .array(z.object({ title: z.string().min(1).max(160, msg("tooLong")), description: z.string().max(1000, msg("tooLong")) }))
        .max(90, msg("tooLong")),
    ),
});

/** Arabic must be complete. French and English can be left entirely blank, but not half done. */
const contentFor = (required: boolean) =>
  contentFields.superRefine((c, ctx) => {
    const started =
      c.title || c.location || c.summary || c.description || c.included.length || c.excluded.length || c.itinerary.length;
    if (!required && !started) return;
    const need = (path: keyof typeof c, ok: boolean, key: ErrorKey) => {
      if (!ok) ctx.addIssue({ code: "custom", path: [path], message: key });
    };
    need("title", c.title.length >= 3, "titleRequired");
    need("location", c.location.length >= 2, "locationRequired");
    need("summary", c.summary.length >= 10, "summaryRequired");
    need("description", c.description.length >= 20, "descriptionRequired");
  });

export const destinationSchema = z
  .object({
    category: z.enum(CATEGORIES, msg("categoryRequired")),
    price: wholeNumber("priceRequired").pipe(z.number().min(0, msg("priceNegative")).max(1_000_000_000, msg("priceTooHigh"))),
    durationDays: wholeNumber("durationRequired").pipe(z.number().min(1, msg("durationMin")).max(365, msg("durationMax"))),
    startDate: dateString,
    endDate: dateString,
    capacity: wholeNumber("capacityRequired").pipe(z.number().min(1, msg("capacityMin")).max(100_000, msg("capacityMax"))),
    images: z
      .string()
      .transform(lines)
      .pipe(z.array(httpsUrl).min(1, msg("imagesRequired")).max(12, msg("imagesMax"))),
    published: z.preprocess((v) => v === "on", z.boolean()),
    featured: z.preprocess((v) => v === "on", z.boolean()),
    content: z.object({ ar: contentFor(true), fr: contentFor(false), en: contentFor(false) }),
  })
  .refine((d) => d.endDate >= d.startDate, { path: ["endDate"], message: msg("endBeforeStart") });

/**
 * Field errors in the visitor's language, keyed by dotted field name such as
 * "content.fr.title". Array items report under their parent, e.g. "images".
 */
export function fieldErrors(error: z.ZodError, t: Dict) {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const segments = issue.path.filter((part) => typeof part === "string");
    const key = segments.slice(0, segments[0] === "content" ? 3 : 1).join(".");
    const message = t.errors[issue.message as ErrorKey] ?? t.errors.invalid;
    (result[key] ??= []).push(message);
  }
  return result;
}
