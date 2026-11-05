import type { Metadata } from "next";
import { DestinationForm, type LocaleValues } from "@/components/admin/destination-form";
import { getI18n } from "@/i18n/server";
import { requireAdmin } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.addDestination };
}

const blank: LocaleValues = { title: "", location: "", summary: "", description: "", included: "", excluded: "", itinerary: "" };

export default async function NewDestinationPage() {
  await requireAdmin();
  const { t } = await getI18n();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{t.admin.addDestination}</h1>
      <DestinationForm
        values={{
          category: "",
          price: "",
          durationDays: "",
          startDate: "",
          endDate: "",
          capacity: "",
          images: "",
          published: true,
          featured: false,
          content: { ar: blank, fr: blank, en: blank },
        }}
      />
    </div>
  );
}
