import { prisma } from '../utils/prisma';
import { BUSINESS_CONSTANTS } from '../constants/business';
import { BADGE_IDS } from '../constants/badge-ids';

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
  const xpEarned = BUSINESS_CONSTANTS.XP_PER_SESSION + Math.floor(score / BUSINESS_CONSTANTS.XP_SCORE_DIVISOR);

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

  // ─── Badge granting (best-effort, never breaks the session) ───────────────
  try {
    await grantEarnedBadges(userId, gameId, score);
  } catch {
    // badge errors must not propagate to the caller
  }

  return session;
}

async function grantEarnedBadges(userId: string, gameId: string, score: number) {
  const [totalSessions, game, vrSessions] = await Promise.all([
    prisma.gameSession.count({ where: { userId } }),
    prisma.game.findUnique({ where: { id: gameId }, select: { category: true } }),
    prisma.gameSession.count({ where: { userId, game: { category: 'VR' } } }),
  ]);

  const badgesToGrant: string[] = [];

  if (totalSessions === 1) {
    badgesToGrant.push(BADGE_IDS.FIRST_PLAY);
  }
  if (score >= BUSINESS_CONSTANTS.BADGE_HIGH_SCORE_THRESHOLD) {
    badgesToGrant.push(BADGE_IDS.HIGH_SCORE);
  }
  if (game?.category === 'VR' && vrSessions >= BUSINESS_CONSTANTS.BADGE_VR_MASTER_SESSIONS) {
    badgesToGrant.push(BADGE_IDS.VR_MASTER);
  }

  if (badgesToGrant.length === 0) return;

  await Promise.all(
    badgesToGrant.map((badgeId) =>
      prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        update: {},
        create: { userId, badgeId },
      }),
    ),
  );
}
