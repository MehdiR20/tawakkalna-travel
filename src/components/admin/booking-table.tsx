import Link from "next/link";
import { updateBookingStatusAction } from "@/actions/admin";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/ui";
import type { Dict } from "@/i18n/dictionaries";
import { getI18n } from "@/i18n/server";
import { formatDate, formatMoney } from "@/lib/format";
import type { BookingStatusKey } from "@/lib/site";
import { tripContent } from "@/lib/trip-content";
import { ConfirmSubmit } from "./confirm-submit";

export type AdminBooking = {
  id: string;
  reference: string;
  status: BookingStatusKey;
  travelDate: Date;
  travelers: number;
  totalPrice: number;
  notes: string | null;
  createdAt: Date;
  user: { name: string; email: string; phone: string | null };
  destination: { id: string; content: unknown };
};

export async function BookingTable({ bookings }: { bookings: AdminBooking[] }) {
  const { locale, t } = await getI18n();
  if (bookings.length === 0) return <EmptyState title={t.admin.noReservations} />;

  const a = t.admin;
  const headings = [a.colReference, a.colCustomer, a.colTrip, a.colDeparture, a.colTotal, a.colStatus, a.colActions];

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[56rem] text-start text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col" className="px-4 py-3 text-start font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {bookings.map((booking) => (
            <tr key={booking.id} className="align-top">
              <td className="px-4 py-3.5">
                <Link href={`/bookings/${booking.reference}`} dir="ltr" className="font-mono font-semibold underline-offset-2 hover:underline">
                  {booking.reference}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{a.booked(formatDate(booking.createdAt, locale))}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-medium">{booking.user.name}</p>
                <p className="text-xs break-all text-muted">
                  <bdi dir="ltr">{booking.user.email}</bdi>
                </p>
                {booking.user.phone && (
                  <p className="text-xs text-muted">
                    <bdi dir="ltr">{booking.user.phone}</bdi>
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5">
                <p className="font-medium">{tripContent(booking.destination.content, locale).title}</p>
                {booking.notes && <p className="mt-0.5 max-w-52 text-xs text-muted">{a.note(booking.notes)}</p>}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                {formatDate(booking.travelDate, locale)}
                <p className="text-xs text-muted">{t.common.travelers(booking.travelers)}</p>
              </td>
              <td className="px-4 py-3.5 font-semibold whitespace-nowrap">{formatMoney(booking.totalPrice, locale)}</td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-3.5">
                <BookingActions id={booking.id} status={booking.status} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingActions({ id, status, t }: { id: string; status: BookingStatusKey; t: Dict }) {
  if (status === "CANCELLED") return <span className="text-xs text-muted">{t.admin.noActions}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "PENDING" && (
        <form action={updateBookingStatusAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="CONFIRMED" />
          <ConfirmSubmit
            label={t.admin.markPaid}
            confirmLabel={t.admin.confirmPayment}
            className="min-h-9 rounded-lg bg-forest-900 px-3 text-xs font-semibold whitespace-nowrap text-white hover:bg-forest-800"
            armedClassName="min-h-9 rounded-lg bg-forest-700 px-3 text-xs font-semibold whitespace-nowrap text-white"
          />
        </form>
      )}
      <form action={updateBookingStatusAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="CANCELLED" />
        <ConfirmSubmit
          label={t.admin.cancel}
          confirmLabel={t.admin.confirmCancel}
          className="min-h-9 rounded-lg px-3 text-xs font-medium whitespace-nowrap text-clay-700 hover:bg-clay-100"
          armedClassName="min-h-9 rounded-lg bg-clay-600 px-3 text-xs font-semibold whitespace-nowrap text-white"
        />
      </form>
    </div>
  );
}
