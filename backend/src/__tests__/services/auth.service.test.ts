import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';
import { authService } from '../../services/auth.service';
import { prisma } from '../../utils/prisma';
import { sendEmail } from '../../utils/mailer';
import { ERROR_CODES } from '../../constants/error-codes';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../utils/prisma');
jest.mock('../../utils/mailer');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        emailVerified: false,
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCard = {
        id: 'card-1',
        userId: 'user-1',
        balance: 0,
        nfcTagId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaMock.user.create = jest.fn().mockResolvedValue(mockUser);
      prismaMock.card.create = jest.fn().mockResolvedValue(mockCard);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.card.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', balance: 0 }
      });
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        })
      ).rejects.toThrow(ERROR_CODES.EMAIL_TAKEN);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        emailVerified: true,
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrongpass'
        })
      ).rejects.toThrow(ERROR_CODES.INVALID_CREDENTIALS);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        emailVerified: false
      };

      prismaMock.user.findFirst = jest.fn().mockResolvedValue(mockUser);
      prismaMock.user.update = jest.fn().mockResolvedValue({ ...mockUser, emailVerified: true });

      await authService.verifyEmail('valid-token');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { emailVerified: true, emailVerificationToken: null }
      });
    });

    it('should throw error with invalid token', async () => {
      prismaMock.user.findFirst = jest.fn().mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        ERROR_CODES.INVALID_TOKEN
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        refreshToken: 'valid-refresh-token'
      };

      prismaMock.user.findFirst = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid refresh token', async () => {
      prismaMock.user.findFirst = jest.fn().mockResolvedValue(null);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        ERROR_CODES.INVALID_TOKEN
      );
    });
  });
});
