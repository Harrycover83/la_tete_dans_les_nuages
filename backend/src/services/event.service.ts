import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { CACHE_KEYS } from '../constants/cache-keys';
import { CACHE_TTL } from '../constants/cache-ttl';
import { ERROR_CODES } from '../constants/error-codes';

export async function getUpcomingEvents(venueId?: string) {
  const cacheKey = venueId ? `${CACHE_KEYS.EVENTS_UPCOMING}:${venueId}` : CACHE_KEYS.EVENTS_UPCOMING;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      startDate: { gte: new Date() },
      ...(venueId ? { venueId } : {}),
    },
    include: {
      venue: { select: { id: true, name: true, city: true, address: true } },
      _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
    },
    orderBy: { startDate: 'asc' },
    take: 20,
  });

  await redis.setex(cacheKey, CACHE_TTL.EVENTS, JSON.stringify(events));
  return events;
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: { select: { id: true, name: true, city: true, address: true, phone: true } },
      _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
    },
  });
  if (!event) throw new Error(ERROR_CODES.EVENT_NOT_FOUND);
  return event;
}

export async function bookEvent(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } },
  });
  if (!event || !event.isActive) throw new Error(ERROR_CODES.EVENT_NOT_FOUND);
  if (event._count.bookings >= event.maxCapacity) throw new Error(ERROR_CODES.EVENT_FULL);

  const existing = await prisma.booking.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) {
    if (existing.status === 'CONFIRMED') throw new Error(ERROR_CODES.ALREADY_BOOKED);
    // Reactivate cancelled booking
    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: { status: 'CONFIRMED' },
      include: { event: { include: { venue: { select: { name: true, city: true } } } } },
    });
    await redis.del(CACHE_KEYS.USER_BOOKINGS(userId));
    await invalidateEventCache();
    return booking;
  }

  const booking = await prisma.booking.create({
    data: { userId, eventId, status: 'CONFIRMED' },
    include: { event: { include: { venue: { select: { name: true, city: true } } } } },
  });

  await redis.del(CACHE_KEYS.USER_BOOKINGS(userId));
  await invalidateEventCache();
  return booking;
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw new Error(ERROR_CODES.BOOKING_NOT_FOUND);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
  await redis.del(CACHE_KEYS.USER_BOOKINGS(userId));
  await invalidateEventCache();
  return updated;
}

export async function getUserBookings(userId: string) {
  const cached = await redis.get(CACHE_KEYS.USER_BOOKINGS(userId));
  if (cached) return JSON.parse(cached);

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        include: { venue: { select: { id: true, name: true, city: true, address: true } } },
      },
    },
    orderBy: { event: { startDate: 'asc' } },
  });

  await redis.setex(CACHE_KEYS.USER_BOOKINGS(userId), CACHE_TTL.USER_BOOKINGS, JSON.stringify(bookings));
  return bookings;
}

async function invalidateEventCache() {
  const keys = await redis.keys(`${CACHE_KEYS.EVENTS_UPCOMING}*`);
  if (keys.length > 0) await redis.del(keys);
}
