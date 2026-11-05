import { prisma } from "./prisma";

/** Seats not yet held by a pending or confirmed booking. */
export async function getSeatsLeft(destinationId: string, capacity: number) {
  const taken = await prisma.booking.aggregate({
    where: { destinationId, status: { not: "CANCELLED" } },
    _sum: { travelers: true },
  });
  return Math.max(0, capacity - (taken._sum.travelers ?? 0));
}
