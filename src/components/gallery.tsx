"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dirOf } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { flipRtl } from "./ui";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const { locale, t } = useI18n();
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const rtl = dirOf(locale) === "rtl";

  useEffect(() => {
    if (index === null) dialog.current?.close();
    else if (!dialog.current?.open) dialog.current?.showModal();
  }, [index]);

  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count));

  if (count === 0) return <div className="aspect-[16/7] rounded-3xl bg-forest-100" />;

  const shown = images.slice(0, 5);
  return (
    <>
      <div className="relative">
        <div className={`grid gap-2 overflow-hidden rounded-3xl ${shown.length === 1 ? "" : "md:grid-cols-[2fr_1fr]"}`}>
          <Thumb src={shown[0]} label={t.trip.viewPhoto(1, count)} onClick={() => setIndex(0)} className="aspect-[4/3] md:aspect-auto md:h-[28rem]" />
          {shown.length > 1 && (
            <div className="hidden gap-2 md:grid md:h-[28rem] md:auto-rows-fr">
              {shown.slice(1, 3).map((src, i) => (
                <Thumb key={src} src={src} label={t.trip.viewPhoto(i + 2, count)} onClick={() => setIndex(i + 1)} className="min-h-0" />
              ))}
            </div>
          )}
        </div>
        {count > 1 && (
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="absolute end-3 bottom-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-soft"
          >
            <Images aria-hidden className="size-4" /> {t.trip.photos(count)}
          </button>
        )}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          // The "next" key follows reading direction.
          if (e.key === "ArrowRight") step(rtl ? -1 : 1);
          if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
        }}
        aria-label={t.trip.galleryLabel(title)}
        className="on-dark m-0 size-full max-h-none max-w-none bg-forest-950/95 text-white backdrop:bg-transparent"
      >
        {index !== null && (
          <div className="flex size-full flex-col">
            <div className="flex items-center justify-between p-3">
              <p className="px-2 text-sm" aria-live="polite" dir="ltr">
                {index + 1} / {count}
              </p>
              <button type="button" onClick={() => setIndex(null)} aria-label={t.trip.closeGallery} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white/10">
                <X aria-hidden className="size-6" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 px-3 pb-3 sm:px-16">
              <img src={images[index]} alt={t.trip.photoAlt(title, index + 1)} referrerPolicy="no-referrer" className="size-full object-contain" />
              {count > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={t.trip.previousPhoto} className="absolute start-2 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-forest-950/70 hover:bg-forest-800">
                    <ChevronLeft aria-hidden className={`size-6 ${flipRtl}`} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={t.trip.nextPhoto} className="absolute end-2 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-forest-950/70 hover:bg-forest-800">
                    <ChevronRight aria-hidden className={`size-6 ${flipRtl}`} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Thumb({ src, label, onClick, className }: { src: string; label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`group relative block w-full cursor-zoom-in overflow-hidden bg-forest-100 ${className}`}>
      <img src={src} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </button>
  );
}
