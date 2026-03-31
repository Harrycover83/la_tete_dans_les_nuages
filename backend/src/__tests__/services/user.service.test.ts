import { mockDeep } from 'jest-mock-extended';
import { userService } from '../../services/user.service';
import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { ERROR_CODES } from '../../constants/error-codes';
import { CACHE_KEYS, CACHE_TTL } from '../../constants';

jest.mock('../../utils/prisma');
jest.mock('../../utils/redis');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile from cache if available', async () => {
      const cachedProfile = JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });

      redisMock.get = jest.fn().mockResolvedValue(cachedProfile);

      const result = await userService.getProfile('user-1');

      expect(result).toEqual(JSON.parse(cachedProfile));
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEYS.USER_PROFILE('user-1'));
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if not in cache', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        emailVerified: true,
        badges: [],
        card: { balance: 100 }
      };

      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      redisMock.setex = jest.fn().mockResolvedValue('OK');

      const result = await userService.getProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { badges: true, card: true }
      });
      expect(redisMock.setex).toHaveBeenCalledWith(
        CACHE_KEYS.USER_PROFILE('user-1'),
        CACHE_TTL.USER_PROFILE,
        JSON.stringify(mockUser)
      );
    });

    it('should throw error if user not found', async () => {
      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(userService.getProfile('invalid-id')).rejects.toThrow(
        ERROR_CODES.USER_NOT_FOUND
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and invalidate cache', async () => {
      const mockUpdatedUser = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'test@example.com'
      };

      prismaMock.user.update = jest.fn().mockResolvedValue(mockUpdatedUser);
      redisMock.del = jest.fn().mockResolvedValue(1);

      const result = await userService.updateProfile('user-1', {
        firstName: 'Updated',
        lastName: 'Name'
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Updated', lastName: 'Name' }
      });
      expect(redisMock.del).toHaveBeenCalledWith(CACHE_KEYS.USER_PROFILE('user-1'));
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const mockCard = { id: 'card-1' };
      const mockTransactions = [
        {
          id: 'tx-1',
          type: 'RECHARGE',
          amount: 50,
          createdAt: new Date()
        },
        {
          id: 'tx-2',
          type: 'DEBIT',
          amount: -10,
          createdAt: new Date()
        }
      ];

      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);
      prismaMock.transaction.findMany = jest.fn().mockResolvedValue(mockTransactions);
      prismaMock.transaction.count = jest.fn().mockResolvedValue(2);

      const result = await userService.getTransactionHistory('user-1', 1, 10);

      expect(result.transactions).toEqual(mockTransactions);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
