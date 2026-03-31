import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './utils/config';
import { prisma } from './utils/prisma';
import { redis } from './utils/redis';
import { authLimiter, apiLimiter, adminLimiter } from './middlewares/rate-limiter.middleware';

import authRoutes from './routes/auth.routes';
import cardRoutes from './routes/card.routes';
import rechargeRoutes from './routes/recharge.routes';
import gazetteRoutes from './routes/gazette.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // In development: allow any localhost/127.0.0.1 origin regardless of port
    if (config.NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // In production: allow only the configured FRONTEND_URL
    if (origin === config.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));

// Stripe webhooks need raw body
app.use('/api/recharge/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(config.UPLOAD_DIR));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/card', apiLimiter, cardRoutes);
app.use('/api/recharge', apiLimiter, rechargeRoutes);
app.use('/api/gazette', apiLimiter, gazetteRoutes);
app.use('/api/leaderboard', apiLimiter, leaderboardRoutes);
app.use('/api/user', apiLimiter, userRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  await prisma.$connect();
  console.log('✅ PostgreSQL connected');

  await redis.ping();
  console.log('✅ Redis connected');

  app.listen(config.PORT, () => {
    console.log(`🚀 API running on http://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
