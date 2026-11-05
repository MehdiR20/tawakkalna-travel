import Link from "next/link";
import { button } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-clay-600">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t.notFound.title}</h1>
        <p className="mt-2 text-muted">{t.notFound.text}</p>
        <Link href="/destinations" className={`${button.primary} mt-6`}>
          {t.notFound.action}
        </Link>
      </div>
    </main>
  );
}
