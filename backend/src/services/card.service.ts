import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { ERROR_CODES } from '../constants/error-codes';
import { CACHE_KEYS } from '../constants/cache-keys';
import { CACHE_TTL } from '../constants/cache-ttl';

export async function getCard(userId: string) {
  const cacheKey = CACHE_KEYS.CARD(userId);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const card = await prisma.card.findUnique({ where: { userId } });
  if (!card) throw new Error(ERROR_CODES.CARD_NOT_FOUND);

  await redis.setex(cacheKey, CACHE_TTL.CARD_BALANCE, JSON.stringify(card));
  return card;
}

export async function debitCard(cardId: string, amount: number, description?: string, gameId?: string, machineId?: string) {
  if (amount <= 0) throw new Error(ERROR_CODES.INVALID_AMOUNT);

  const result = await prisma.$transaction(async (tx) => {
    const card = await tx.card.findUnique({ where: { cardId } });
    if (!card) throw new Error(ERROR_CODES.CARD_NOT_FOUND);
    if (card.balance < amount) throw new Error(ERROR_CODES.INSUFFICIENT_BALANCE);

    const updated = await tx.card.update({
      where: { cardId },
      data: { balance: { decrement: amount } },
    });

    await tx.transaction.create({
      data: {
        type: 'DEBIT',
        amount: -amount,
        balanceAfter: updated.balance,
        description,
        gameId,
        machineId,
        userId: card.userId,
        cardId: card.id,
      },
    });

    return updated;
  });

  // Invalidate cache
  await redis.del(CACHE_KEYS.CARD(result.userId));
  return result;
}

export async function creditCard(userId: string, units: number, description: string, stripePaymentId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const card = await tx.card.findUnique({ where: { userId } });
    if (!card) throw new Error(ERROR_CODES.CARD_NOT_FOUND);

    const updated = await tx.card.update({
      where: { userId },
      data: { balance: { increment: units } },
    });

    await tx.transaction.create({
      data: {
        type: 'RECHARGE',
        amount: units,
        balanceAfter: updated.balance,
        description,
        stripePaymentId,
        userId,
        cardId: card.id,
      },
    });

    return updated;
  });

  await redis.del(CACHE_KEYS.CARD(userId));
  return result;
}

export async function getTransactions(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { game: { select: { id: true, name: true } } },
    }),
  ]);
  return { total, page, limit, transactions };
}
