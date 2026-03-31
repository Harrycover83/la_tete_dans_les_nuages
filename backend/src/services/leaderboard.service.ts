import { prisma } from '../utils/prisma';

export async function getLeaderboard(gameId: string, venueId?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      gameId,
      ...(venueId && {
        game: { venues: { some: { venueId } } },
      }),
    },
    orderBy: { maxScore: 'desc' },
    skip,
    take: limit,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
  return entries;
}

export async function getUserStats(userId: string) {
  const [gameSessions, leaderboardEntries, userBadges] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { game: { select: { id: true, name: true } } },
    }),
    prisma.leaderboardEntry.findMany({
      where: { userId },
      include: { game: { select: { id: true, name: true } } },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    }),
  ]);

  const totalXp = leaderboardEntries.reduce((sum, e) => sum + e.totalXp, 0);

  return { gameSessions, leaderboardEntries, userBadges, totalXp };
}

export async function recordGameSession(
  userId: string,
  gameId: string,
  score: number,
  duration: number
) {
  const XP_PER_SESSION = 10;
  const xpEarned = XP_PER_SESSION + Math.floor(score / 100);

  const session = await prisma.gameSession.create({
    data: { userId, gameId, score, duration, xpEarned },
  });

  // Upsert leaderboard
  const existing = await prisma.leaderboardEntry.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });

  if (!existing) {
    await prisma.leaderboardEntry.create({
      data: { userId, gameId, maxScore: score, totalXp: xpEarned },
    });
  } else {
    await prisma.leaderboardEntry.update({
      where: { userId_gameId: { userId, gameId } },
      data: {
        maxScore: Math.max(existing.maxScore, score),
        totalXp: { increment: xpEarned },
      },
    });
  }

  return session;
}
