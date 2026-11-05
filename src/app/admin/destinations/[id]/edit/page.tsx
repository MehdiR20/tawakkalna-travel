import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationForm, type LocaleValues } from "@/components/admin/destination-form";
import { LOCALES, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { asStringArray, toDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { tripContent, type TripContent } from "@/lib/trip-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.editMeta };
}

function toFormValues(content?: TripContent): LocaleValues {
  return {
    title: content?.title ?? "",
    location: content?.location ?? "",
    summary: content?.summary ?? "",
    description: content?.description ?? "",
    included: content?.included.join("\n") ?? "",
    excluded: content?.excluded.join("\n") ?? "",
    itinerary:
      content?.itinerary.map((step) => (step.description ? `${step.title} | ${step.description}` : step.title)).join("\n") ?? "",
  };
}

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { locale, t } = await getI18n();
  const { id } = await params;
  const destination = await prisma.destination.findUnique({ where: { id } });
  if (!destination) notFound();

  // Read the stored translations directly: a missing one must stay blank here,
  // not be filled in with the Arabic fallback visitors see.
  const stored = destination.content as Partial<Record<Locale, TripContent>>;
  const content = Object.fromEntries(LOCALES.map((l) => [l, toFormValues(stored[l])])) as Record<Locale, LocaleValues>;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{t.admin.editTitle(tripContent(destination.content, locale).title)}</h1>
      <DestinationForm
        values={{
          id: destination.id,
          category: destination.category,
          price: destination.price,
          durationDays: destination.durationDays,
          startDate: toDateInput(destination.startDate),
          endDate: toDateInput(destination.endDate),
          capacity: destination.capacity,
          images: asStringArray(destination.images).join("\n"),
          published: destination.published,
          featured: destination.featured,
          content,
        }}
      />
    </div>
  );
}
