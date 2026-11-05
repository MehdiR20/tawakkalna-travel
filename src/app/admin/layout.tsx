import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { flipRtl } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { requireAdmin } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.admin.metaTitle, template: `%s | ${t.admin.titleSuffix}` },
    robots: { index: false },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { t } = await getI18n();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="on-dark bg-forest-950 p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-2 lg:block">
          <Logo light />
          <div className="lg:hidden">
            <LanguageSwitcher light />
          </div>
        </div>
        <div className="mt-4 lg:mt-8 lg:flex-1">
          <AdminNav />
        </div>
        <div className="mt-2 hidden lg:block">
          <LanguageSwitcher light />
        </div>
        <Link href="/" className="mt-2 hidden min-h-11 items-center gap-2 px-3 text-sm text-white/75 hover:text-white lg:flex">
          <ArrowUpRight aria-hidden className={`size-4 ${flipRtl}`} /> {t.admin.viewWebsite}
        </Link>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
