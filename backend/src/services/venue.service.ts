import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { CACHE_KEYS } from '../constants/cache-keys';
import { CACHE_TTL } from '../constants/cache-ttl';
import { ERROR_CODES } from '../constants/error-codes';

export async function getVenues() {
  const cached = await redis.get(CACHE_KEYS.VENUES_ALL);
  if (cached) return JSON.parse(cached);

  const venues = await prisma.venue.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      phone: true,
      imageUrl: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { name: 'asc' },
  });

  await redis.setex(CACHE_KEYS.VENUES_ALL, CACHE_TTL.VENUES, JSON.stringify(venues));
  return venues;
}

export async function getVenueById(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      games: { include: { game: { select: { id: true, name: true, category: true, imageUrl: true } } } },
      events: {
        where: { isActive: true, startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 10,
      },
    },
  });

  if (!venue) throw new Error(ERROR_CODES.VENUE_NOT_FOUND);
  return venue;
}
