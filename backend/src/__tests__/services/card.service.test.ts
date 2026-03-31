import { cardService } from '../../services/card.service';
import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { ERROR_CODES } from '../../constants/error-codes';
import { CACHE_KEYS, BUSINESS } from '../../constants';

jest.mock('../../utils/prisma');
jest.mock('../../utils/redis');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe('CardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return card balance from cache if available', async () => {
      const cachedBalance = '100';
      redisMock.get = jest.fn().mockResolvedValue(cachedBalance);

      const result = await cardService.getBalance('user-1');

      expect(result).toEqual({ balance: 100 });
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEYS.CARD_BALANCE('user-1'));
    });

    it('should fetch from DB if not in cache', async () => {
      const mockCard = { id: 'card-1', balance: 150, userId: 'user-1' };

      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);
      redisMock.setex = jest.fn().mockResolvedValue('OK');

      const result = await cardService.getBalance('user-1');

      expect(result).toEqual({ balance: 150 });
      expect(prismaMock.card.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' }
      });
    });

    it('should throw error if card not found', async () => {
      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.card.findUnique = jest.fn().mockResolvedValue(null);

      await expect(cardService.getBalance('invalid-user')).rejects.toThrow(
        ERROR_CODES.CARD_NOT_FOUND
      );
    });
  });

  describe('debitCard', () => {
    it('should debit card successfully', async () => {
      const mockCard = { id: 'card-1', balance: 100, userId: 'user-1' };
      const mockVenue = { id: 'venue-1', name: 'Venue' };

      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);
      prismaMock.venue.findUnique = jest.fn().mockResolvedValue(mockVenue);
      prismaMock.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback(prismaMock);
      });
      prismaMock.card.update = jest.fn().mockResolvedValue({ ...mockCard, balance: 90 });
      prismaMock.transaction.create = jest.fn().mockResolvedValue({});
      redisMock.del = jest.fn().mockResolvedValue(1);

      const result = await cardService.debitCard('user-1', 'venue-1', 10, 'Game play');

      expect(result.newBalance).toBe(90);
      expect(prismaMock.card.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { balance: 90 }
      });
    });

    it('should throw error if insufficient balance', async () => {
      const mockCard = { id: 'card-1', balance: 5, userId: 'user-1' };

      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);

      await expect(
        cardService.debitCard('user-1', 'venue-1', 10, 'Game')
      ).rejects.toThrow(ERROR_CODES.INSUFFICIENT_BALANCE);
    });
  });
});
