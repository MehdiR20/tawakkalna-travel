"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { BookingStatusKey } from "@/lib/site";

const statusStyles: Record<BookingStatusKey, { className: string; Icon: typeof Clock }> = {
  PENDING: { className: "bg-clay-100 text-clay-700", Icon: Clock },
  CONFIRMED: { className: "bg-forest-100 text-forest-800", Icon: CheckCircle2 },
  CANCELLED: { className: "bg-stone-200 text-stone-700", Icon: XCircle },
};

export function StatusBadge({ status, full = false }: { status: BookingStatusKey; full?: boolean }) {
  const { t } = useI18n();
  const { className, Icon } = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {full ? t.status.full[status] : t.status.short[status]}
    </span>
  );
}
