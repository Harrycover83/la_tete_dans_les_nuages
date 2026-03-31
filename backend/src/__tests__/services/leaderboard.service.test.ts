import { leaderboardService } from '../../services/leaderboard.service';
import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { CACHE_KEYS } from '../../constants';

jest.mock('../../utils/prisma');
jest.mock('../../utils/redis');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe('LeaderboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard from cache if available', async () => {
      const cachedLeaderboard = JSON.stringify([
        {
          userId: 'user-1',
          user: { firstName: 'John', lastName: 'Doe', avatarUrl: null },
          score: 1000,
          rank: 1
        }
      ]);

      redisMock.get = jest.fn().mockResolvedValue(cachedLeaderboard);

      const result = await leaderboardService.getLeaderboard('game-1');

      expect(result).toEqual(JSON.parse(cachedLeaderboard));
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEYS.LEADERBOARD('game-1'));
    });

    it('should fetch from DB and cache if not in cache', async () => {
      const mockSessions = [
        {
          userId: 'user-1',
          user: { firstName: 'John', lastName: 'Doe', avatarUrl: null },
          score: 1000
        },
        {
          userId: 'user-2',
          user: { firstName: 'Jane', lastName: 'Smith', avatarUrl: null },
          score: 900
        }
      ];

      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.gameSession.findMany = jest.fn().mockResolvedValue(mockSessions);
      redisMock.setex = jest.fn().mockResolvedValue('OK');

      const result = await leaderboardService.getLeaderboard('game-1');

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].score).toBe(1000);
      expect(result[1].rank).toBe(2);
      expect(prismaMock.gameSession.findMany).toHaveBeenCalledWith({
        where: { gameId: 'game-1' },
        select: {
          userId: true,
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          score: true
        },
        orderBy: { score: 'desc' },
        take: 100
      });
    });
  });

  describe('recordGameSession', () => {
    it('should record game session and invalidate leaderboard cache', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        gameId: 'game-1',
        score: 500
      };

      prismaMock.gameSession.create = jest.fn().mockResolvedValue(mockSession);
      redisMock.del = jest.fn().mockResolvedValue(1);

      const result = await leaderboardService.recordGameSession({
        userId: 'user-1',
        gameId: 'game-1',
        score: 500,
        venueId: 'venue-1'
      });

      expect(result).toEqual(mockSession);
      expect(prismaMock.gameSession.create).toHaveBeenCalled();
      expect(redisMock.del).toHaveBeenCalledWith(CACHE_KEYS.LEADERBOARD('game-1'));
    });
  });
});
