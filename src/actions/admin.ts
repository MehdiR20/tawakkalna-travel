"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { LOCALES, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { parseDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { buildSearchText, type TripContent } from "@/lib/trip-content";
import { destinationSchema, fieldErrors, idSchema, type ActionState } from "@/lib/validation";

function revalidateDestinations(id?: string) {
  revalidatePath("/");
  revalidatePath("/destinations");
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/destinations/${id}`);
}

/** Turns flat "content.fr.title" form fields into { content: { fr: { title } } }. */
function readDestinationForm(data: FormData) {
  const content: Record<string, Record<string, FormDataEntryValue>> = {};
  const rest: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of data) {
    const match = key.match(/^content\.(\w+)\.(\w+)$/);
    if (match) (content[match[1]] ??= {})[match[2]] = value;
    else rest[key] = value;
  }
  return { ...rest, content };
}

export async function saveDestinationAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getI18n();

  const rawId = data.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { error: t.admin.unknownDestination };

  const parsed = destinationSchema.safeParse(readDestinationForm(data));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t) };

  // Translations left blank are not stored, so visitors fall back to Arabic.
  const content: Partial<Record<Locale, TripContent>> = {};
  for (const locale of LOCALES) {
    if (parsed.data.content[locale].title) content[locale] = parsed.data.content[locale];
  }

  const values = {
    category: parsed.data.category,
    price: parsed.data.price,
    durationDays: parsed.data.durationDays,
    capacity: parsed.data.capacity,
    images: parsed.data.images,
    published: parsed.data.published,
    featured: parsed.data.featured,
    startDate: parseDateInput(parsed.data.startDate),
    endDate: parseDateInput(parsed.data.endDate),
    content: content as Prisma.InputJsonObject,
    searchText: buildSearchText(content),
  };

  if (id) {
    const { count } = await prisma.destination.updateMany({ where: { id: id.data }, data: values });
    if (count === 0) return { error: t.admin.destinationGone };
    revalidateDestinations(id.data);
  } else {
    await prisma.destination.create({ data: values });
    revalidateDestinations();
  }
  redirect("/admin/destinations");
}

export async function togglePublishedAction(data: FormData) {
  await requireAdmin();
  const id = idSchema.parse(data.get("id"));
  const destination = await prisma.destination.findUnique({ where: { id }, select: { published: true } });
  if (!destination) return;
  await prisma.destination.update({ where: { id }, data: { published: !destination.published } });
  revalidateDestinations(id);
}

export async function deleteDestinationAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getI18n();
  const id = idSchema.safeParse(data.get("id"));
  if (!id.success) return { error: t.admin.unknownDestination };

  const bookings = await prisma.booking.count({ where: { destinationId: id.data } });
  if (bookings > 0) return { error: t.admin.cantDelete(bookings) };
  try {
    await prisma.destination.delete({ where: { id: id.data } });
  } catch {
    // A booking may have arrived since the count above; the foreign key refused the delete.
    return { error: t.admin.deleteFailed };
  }
  revalidateDestinations(id.data);
  return { ok: true };
}

const statusChangeSchema = z.object({
  id: idSchema,
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

// A cancelled booking has released its seats, so it can't simply be switched back.
const ALLOWED_FROM = {
  CONFIRMED: ["PENDING"],
  CANCELLED: ["PENDING", "CONFIRMED"],
} as const;

export async function updateBookingStatusAction(data: FormData) {
  await requireAdmin();
  const { id, status } = statusChangeSchema.parse(Object.fromEntries(data));
  await prisma.booking.updateMany({
    where: { id, status: { in: [...ALLOWED_FROM[status]] } },
    data: { status },
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/profile");
}
