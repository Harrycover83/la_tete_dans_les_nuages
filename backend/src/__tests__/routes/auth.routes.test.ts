import request from 'supertest';
import express from 'express';
import { authRoutes } from '../../routes/auth.routes';
import { authService } from '../../services/auth.service';
import { ERROR_CODES } from '../../constants/error-codes';

jest.mock('../../services/auth.service');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResponse);
    });

    it('should return 400 with validation errors', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new Error(ERROR_CODES.EMAIL_TAKEN)
      );

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user-1',
          email: 'test@example.com'
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should return 401 with invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error(ERROR_CODES.INVALID_CREDENTIALS)
      );

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/verify-email/:token', () => {
    it('should verify email successfully', async () => {
      (authService.verifyEmail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post('/auth/verify-email/valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };

      (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });
  });
});
