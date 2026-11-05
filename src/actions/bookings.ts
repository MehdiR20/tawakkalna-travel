"use server";

import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { parseDateInput, todayUtc } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { bookingSchema, fieldErrors, type ActionState } from "@/lib/validation";

class BookingRefused extends Error {
  constructor(
    public field: "travelDate" | "travelers" | "form",
    message: string,
  ) {
    super(message);
  }
}

const MAX_ATTEMPTS = 8;

// Reference collision, write conflict, or lock timeouts. All safe to retry
// because nothing was committed.
const RETRYABLE_CODES = new Set(["P2002", "P2034", "P2028", "P1008"]);

/**
 * Runs bookings one at a time within this server process. SQLite locks the whole
 * file, so concurrent read-then-write transactions stall each other until they
 * time out. Across several server instances on PostgreSQL, the serializable
 * transaction and the retries below are what keep seat counts correct.
 */
let queue: Promise<unknown> = Promise.resolve();
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => undefined);
  return run;
}

function makeReference(attempt: number) {
  // Four digits while they're free; widen after collisions so it can never run out.
  return attempt < 4 ? `TWK-${randomInt(1000, 10000)}` : `TWK-${randomInt(100000, 1000000)}`;
}

export async function createBookingAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser("/destinations");
  const { t } = await getI18n();

  const parsed = bookingSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t) };
  const { destinationId, travelers, notes } = parsed.data;
  const travelDate = parseDateInput(parsed.data.travelDate);

  let reference: string | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !reference; attempt++) {
    try {
      // Serializable, so two people can't both take the last seats.
      const booking = await inOrder(() =>
        prisma.$transaction(
          async (tx) => {
            const destination = await tx.destination.findFirst({
              where: { id: destinationId, published: true },
            });
            if (!destination) throw new BookingRefused("form", t.booking.tripUnavailable);

            if (travelDate < todayUtc() || travelDate < destination.startDate || travelDate > destination.endDate) {
              throw new BookingRefused("travelDate", t.booking.dateOutOfRange);
            }

            const taken = await tx.booking.aggregate({
              where: { destinationId, status: { not: "CANCELLED" } },
              _sum: { travelers: true },
            });
            const seatsLeft = destination.capacity - (taken._sum.travelers ?? 0);
            if (travelers > seatsLeft) {
              throw new BookingRefused(
                "travelers",
                seatsLeft > 0 ? t.booking.onlySeats(seatsLeft) : t.booking.fullyBookedError,
              );
            }

            return tx.booking.create({
              data: {
                reference: makeReference(attempt),
                userId: user.id,
                destinationId,
                travelDate,
                travelers,
                totalPrice: destination.price * travelers,
                notes: notes || null,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        ),
      );
      reference = booking.reference;
    } catch (error) {
      if (error instanceof BookingRefused) {
        return error.field === "form" ? { error: error.message } : { fieldErrors: { [error.field]: [error.message] } };
      }
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(error.code);
      if (!retryable) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  if (!reference) return { error: t.booking.failed };

  revalidatePath("/profile");
  redirect(`/bookings/${reference}`);
}
