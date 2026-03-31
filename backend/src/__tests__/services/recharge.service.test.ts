import Stripe from 'stripe';
import { rechargeService } from '../../services/recharge.service';
import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { ERROR_CODES } from '../../constants/error-codes';
import { CACHE_KEYS } from '../../constants';

jest.mock('../../utils/prisma');
jest.mock('../../utils/redis');
jest.mock('stripe');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe('RechargeService', () => {
  let stripeMock: jest.Mocked<Stripe>;

  beforeEach(() => {
    jest.clearAllMocks();
    stripeMock = new Stripe('test_key') as jest.Mocked<Stripe>;
  });

  describe('getPacks', () => {
    it('should return packs from cache if available', async () => {
      const cachedPacks = JSON.stringify([
        { id: 'pack-1', name: 'Pack 10€', price: 10, credits: 10, bonus: 0 }
      ]);

      redisMock.get = jest.fn().mockResolvedValue(cachedPacks);

      const result = await rechargeService.getPacks();

      expect(result).toEqual(JSON.parse(cachedPacks));
      expect(redisMock.get).toHaveBeenCalledWith(CACHE_KEYS.RECHARGE_PACKS);
    });

    it('should fetch from DB if not in cache', async () => {
      const mockPacks = [
        { id: 'pack-1', name: 'Pack 10€', price: 10, credits: 10, bonus: 0, active: true }
      ];

      redisMock.get = jest.fn().mockResolvedValue(null);
      prismaMock.rechargePack.findMany = jest.fn().mockResolvedValue(mockPacks);
      redisMock.setex = jest.fn().mockResolvedValue('OK');

      const result = await rechargeService.getPacks();

      expect(result).toEqual(mockPacks);
      expect(prismaMock.rechargePack.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { price: 'asc' }
      });
    });
  });

  describe('createPaymentIntent', () => {
    it('should create Stripe payment intent successfully', async () => {
      const mockPack = { id: 'pack-1', price: 10, credits: 10, bonus: 0 };
      const mockCard = { id: 'card-1', userId: 'user-1' };
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'secret_123',
        amount: 1000,
        currency: 'eur',
        status: 'requires_payment_method'
      };

      prismaMock.rechargePack.findUnique = jest.fn().mockResolvedValue(mockPack);
      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);
      stripeMock.paymentIntents.create = jest.fn().mockResolvedValue(mockPaymentIntent as any);

      const result = await rechargeService.createPaymentIntent('user-1', 'pack-1');

      expect(result.clientSecret).toBe('secret_123');
      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'eur',
        metadata: {
          userId: 'user-1',
          packId: 'pack-1',
          credits: '10',
          bonus: '0'
        }
      });
    });

    it('should throw error if pack not found', async () => {
      prismaMock.rechargePack.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        rechargeService.createPaymentIntent('user-1', 'invalid-pack')
      ).rejects.toThrow(ERROR_CODES.PACK_NOT_FOUND);
    });
  });

  describe('handleStripeWebhook', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: {
              userId: 'user-1',
              packId: 'pack-1',
              credits: '10',
              bonus: '2'
            }
          }
        }
      };

      const mockCard = { id: 'card-1', balance: 50, userId: 'user-1' };

      prismaMock.card.findUnique = jest.fn().mockResolvedValue(mockCard);
      prismaMock.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback(prismaMock);
      });
      prismaMock.card.update = jest.fn().mockResolvedValue({ ...mockCard, balance: 62 });
      prismaMock.transaction.create = jest.fn().mockResolvedValue({});
      redisMock.del = jest.fn().mockResolvedValue(1);

      await rechargeService.handleStripeWebhook(mockEvent as any);

      expect(prismaMock.card.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { balance: 62 }
      });
      expect(prismaMock.transaction.create).toHaveBeenCalledTimes(2); // RECHARGE + BONUS
    });
  });
});
