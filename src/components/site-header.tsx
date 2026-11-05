"use client";

import { LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { flipRtl } from "./ui";

type HeaderUser = { name: string; role: "USER" | "ADMIN" } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // On the home page the header floats over the hero photo.
  const overlay = pathname === "/" && !open;

  const nav = [
    { href: "/destinations", label: t.nav.destinations },
    { href: "/#why-us", label: t.nav.whyUs },
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/#contact", label: t.nav.contact },
  ];

  const linkTone = overlay ? "text-white/90 hover:text-white" : "text-muted hover:text-ink";
  const close = () => setOpen(false);

  return (
    <header
      className={
        overlay
          ? "on-dark absolute inset-x-0 top-0 z-30"
          : "sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur"
      }
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo light={overlay} />

        <nav aria-label={t.nav.main} className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`text-sm font-medium whitespace-nowrap transition-colors ${linkTone}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <LanguageSwitcher light={overlay} />
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className={`flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium ${linkTone}`}>
                  <LayoutDashboard aria-hidden className="size-4" /> {t.nav.admin}
                </Link>
              )}
              <Link href="/profile" className={`flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium ${linkTone}`}>
                <UserRound aria-hidden className="size-4" /> {user.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label={t.nav.signOut}
                className={`grid size-11 cursor-pointer place-items-center rounded-full ${linkTone}`}
              >
                <LogOut aria-hidden className={`size-4 ${flipRtl}`} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={`inline-flex min-h-11 items-center rounded-full border px-6 text-sm font-semibold whitespace-nowrap transition-colors ${
                overlay
                  ? "border-white/40 text-white hover:bg-white/10"
                  : "border-line bg-white text-ink hover:border-forest-700"
              }`}
            >
              {t.nav.signIn}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          className={`grid size-11 cursor-pointer place-items-center rounded-full xl:hidden ${
            overlay ? "text-white" : "text-ink"
          }`}
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
        </button>
      </div>

      {open && (
        <nav aria-label={t.nav.mobile} className="border-t border-line bg-paper px-4 py-3 xl:hidden">
          {nav.map((item) => (
            <MobileLink key={item.href} href={item.href} onClick={close}>
              {item.label}
            </MobileLink>
          ))}
          <div className="mt-2 border-t border-line pt-2">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <MobileLink href="/admin" onClick={close}>
                    {t.nav.adminDashboard}
                  </MobileLink>
                )}
                <MobileLink href="/profile" onClick={close}>
                  {t.nav.myBookings}
                </MobileLink>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex min-h-11 w-full cursor-pointer items-center text-start text-base font-medium text-ink"
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <MobileLink href="/login" onClick={close}>
                {t.nav.signIn}
              </MobileLink>
            )}
          </div>
          <div className="mt-2 border-t border-line pt-2">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex min-h-11 items-center text-base font-medium text-ink">
      {children}
    </Link>
  );
}
