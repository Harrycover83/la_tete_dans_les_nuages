import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

// Mock Redis
jest.mock('../utils/redis', () => ({
  redis: mockDeep<Redis>()
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

// Mock mailer
jest.mock('../utils/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Reset tous les mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});
