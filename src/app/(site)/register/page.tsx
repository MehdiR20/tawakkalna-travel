import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getI18n } from "@/i18n/server";
import { safeCallbackUrl } from "@/lib/safe-callback";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.registerMeta };
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string | string[] }> }) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.auth.createTitle}</h1>
      <p className="mt-2 text-muted">{t.auth.createText}</p>
      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {t.auth.haveAccount}{" "}
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-clay-600 underline">
          {t.auth.signInLink}
        </Link>
      </p>
    </div>
  );
}
