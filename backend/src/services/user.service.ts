import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { ERROR_CODES } from '../constants/error-codes';
import { CACHE_KEYS } from '../constants/cache-keys';
import { CACHE_TTL } from '../constants/cache-ttl';

/**
 * Récupère le profil complet d'un utilisateur
 */
export async function getProfile(userId: string) {
  const cacheKey = CACHE_KEYS.USER_PROFILE(userId);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      card: true,
      userBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      },
    },
  });

  if (!user) throw new Error(ERROR_CODES.USER_NOT_FOUND);

  const profile = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl,
    role: user.role,
    emailVerified: user.emailVerified,
    card: user.card,
    badges: user.userBadges,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await redis.setex(cacheKey, CACHE_TTL.USER_PROFILE, JSON.stringify(profile));
  return profile;
}

/**
 * Met à jour les informations du profil utilisateur
 */
export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
  }
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
    include: {
      card: true,
      userBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      },
    },
  });

  // Invalidate cache
  await redis.del(CACHE_KEYS.USER_PROFILE(userId));

  return {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    dateOfBirth: updated.dateOfBirth,
    avatarUrl: updated.avatarUrl,
    role: updated.role,
    emailVerified: updated.emailVerified,
    card: updated.card,
    badges: updated.userBadges,
  };
}

/**
 * Récupère l'historique des transactions d'un utilisateur avec pagination
 */
export async function getTransactionHistory(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    transactions,
  };
}
