import Redis from 'ioredis';
import { config } from './config';

export const redis = new Redis(config.REDIS_URL, {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
