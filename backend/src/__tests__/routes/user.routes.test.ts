import request from 'supertest';
import express from 'express';
import { userRoutes } from '../../routes/user.routes';
import { userService } from '../../services/user.service';
import { authMiddleware } from '../../middlewares/auth.middleware';

jest.mock('../../services/user.service');
jest.mock('../../middlewares/auth.middleware');

const app = express();
app.use(express.json());

(authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
  req.userId = 'user-1';
  next();
});

app.use('/user', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user/profile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        card: { balance: 100 },
        badges: []
      };

      (userService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app).get('/user/profile');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
    });
  });

  describe('PATCH /user/profile', () => {
    it('should update user profile', async () => {
      const mockUpdated = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'Name'
      };

      (userService.updateProfile as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .patch('/user/profile')
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
    });
  });

  describe('GET /user/transactions', () => {
    it('should return transaction history', async () => {
      const mockHistory = {
        transactions: [{ id: 'tx-1', type: 'RECHARGE', amount: 50 }],
        total: 1,
        page: 1,
        limit: 10
      };

      (userService.getTransactionHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app).get('/user/transactions?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistory);
    });
  });
});
