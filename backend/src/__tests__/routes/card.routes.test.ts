import request from 'supertest';
import express from 'express';
import { cardRoutes } from '../../routes/card.routes';
import { cardService } from '../../services/card.service';
import { authMiddleware } from '../../middlewares/auth.middleware';

jest.mock('../../services/card.service');
jest.mock('../../middlewares/auth.middleware');

const app = express();
app.use(express.json());

// Mock auth middleware to inject userId
(authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
  req.userId = 'user-1';
  next();
});

app.use('/card', cardRoutes);

describe('Card Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /card/balance', () => {
    it('should return card balance', async () => {
      (cardService.getBalance as jest.Mock).mockResolvedValue({ balance: 100 });

      const response = await request(app).get('/card/balance');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ balance: 100 });
    });
  });

  describe('POST /card/debit', () => {
    it('should debit card successfully', async () => {
      (cardService.debitCard as jest.Mock).mockResolvedValue({
        newBalance: 90,
        transaction: { id: 'tx-1' }
      });

      const response = await request(app)
        .post('/card/debit')
        .send({
          venueId: 'venue-1',
          amount: 10,
          description: 'Game play'
        });

      expect(response.status).toBe(200);
      expect(response.body.newBalance).toBe(90);
    });
  });

  describe('GET /card/transactions', () => {
    it('should return transaction history', async () => {
      (cardService.getTransactionHistory as jest.Mock).mockResolvedValue({
        transactions: [
          { id: 'tx-1', type: 'RECHARGE', amount: 50 },
          { id: 'tx-2', type: 'DEBIT', amount: -10 }
        ],
        total: 2
      });

      const response = await request(app).get('/card/transactions');

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(2);
    });
  });
});
