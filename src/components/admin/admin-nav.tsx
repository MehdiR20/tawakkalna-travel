"use client";

import { CalendarCheck, LayoutDashboard, MapPinned } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/provider";

export function AdminNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: t.admin.overview, Icon: LayoutDashboard, exact: true },
    { href: "/admin/destinations", label: t.admin.destinations, Icon: MapPinned, exact: false },
    { href: "/admin/bookings", label: t.admin.reservations, Icon: CalendarCheck, exact: false },
  ];

  return (
    <nav aria-label={t.admin.navLabel} className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon aria-hidden className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
