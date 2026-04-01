import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { CACHE_KEYS } from '../constants/cache-keys';
import { CACHE_TTL } from '../constants/cache-ttl';
import { ERROR_CODES } from '../constants/error-codes';

export interface CreateSessionBookingInput {
  userId: string;
  venueId: string;
  eventTypeId: string;
  participants: number;
  bookingDate: Date;
  timeSlot: string;
  formulaId?: string;
  cakeId?: string;
  totalPrice: number;
  notes?: string;
}

export async function createSessionBooking(input: CreateSessionBookingInput) {
  // Validate venue exists
  const venue = await prisma.venue.findUnique({ where: { id: input.venueId } });
  if (!venue || !venue.isActive) throw new Error(ERROR_CODES.VENUE_NOT_FOUND);

  // Validate booking date is in the future
  if (input.bookingDate <= new Date()) throw new Error(ERROR_CODES.INVALID_BOOKING_DATE);

  // Validate participants
  if (input.participants < 1 || input.participants > 50) throw new Error(ERROR_CODES.INVALID_PARTICIPANTS);

  const booking = await prisma.sessionBooking.create({
    data: {
      userId: input.userId,
      venueId: input.venueId,
      eventTypeId: input.eventTypeId,
      participants: input.participants,
      bookingDate: input.bookingDate,
      timeSlot: input.timeSlot,
      formulaId: input.formulaId,
      cakeId: input.cakeId,
      totalPrice: input.totalPrice,
      notes: input.notes,
      status: 'CONFIRMED',
    },
    include: {
      venue: { select: { id: true, name: true, city: true, address: true } },
    },
  });

  await redis.del(CACHE_KEYS.USER_SESSION_BOOKINGS(input.userId));
  return booking;
}

export async function getUserSessionBookings(userId: string) {
  const cached = await redis.get(CACHE_KEYS.USER_SESSION_BOOKINGS(userId));
  if (cached) return JSON.parse(cached);

  const bookings = await prisma.sessionBooking.findMany({
    where: { userId, status: { not: 'CANCELLED' } },
    include: {
      venue: { select: { id: true, name: true, city: true, address: true } },
    },
    orderBy: { bookingDate: 'asc' },
  });

  await redis.setex(
    CACHE_KEYS.USER_SESSION_BOOKINGS(userId),
    CACHE_TTL.USER_SESSION_BOOKINGS,
    JSON.stringify(bookings),
  );
  return bookings;
}

export async function cancelSessionBooking(userId: string, bookingId: string) {
  const booking = await prisma.sessionBooking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw new Error(ERROR_CODES.SESSION_BOOKING_NOT_FOUND);

  const updated = await prisma.sessionBooking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });

  await redis.del(CACHE_KEYS.USER_SESSION_BOOKINGS(userId));
  return updated;
}
