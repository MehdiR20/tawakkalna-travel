"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { SITE } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  const { t } = useI18n();
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label={`${t.site.name}, ${t.nav.home}`}>
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full ${
          light ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-forest-900 text-white"
        }`}
      >
        <Compass aria-hidden className="size-5" />
      </span>
      <span className={`leading-tight ${light ? "text-white" : "text-forest-900"}`}>
        <span lang="ar" className="block font-arabic text-sm font-bold">
          {SITE.nameAr}
        </span>
        <span className={`block text-[11px] font-medium ${light ? "text-white/80" : "text-muted"}`}>{t.site.subName}</span>
      </span>
    </Link>
  );
}
