import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { prisma } from '../utils/prisma';
import * as gazetteService from '../services/gazette.service';
import { z } from 'zod';
import { ArticleCategory } from '@prisma/client';

const router = Router();

// Apply auth + admin check to all routes
router.use(authenticate, requireAdmin);

// ─── Articles ──────────────────────────────────────────────────────────────
router.get('/articles', async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { venues: { include: { venue: true } } },
  });
  res.json(articles);
});

const articleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.nativeEnum(ArticleCategory),
  coverImage: z.string().optional(),
  isPinned: z.boolean().optional(),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  venueIds: z.array(z.string().uuid()).optional(),
});

router.post('/articles', validate(articleSchema), async (req, res) => {
  try {
    const data = req.body;
    const article = await gazetteService.createArticle({
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
    res.status(201).json(article);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.put('/articles/:id', validate(articleSchema.partial()), async (req, res) => {
  try {
    const data = req.body;
    const article = await gazetteService.updateArticle(req.params.id, {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
    res.json(article);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.delete('/articles/:id', async (req, res) => {
  try {
    await gazetteService.deleteArticle(req.params.id);
    res.json({ message: 'ARTICLE_DELETED' });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// ─── Recharge Packs ─────────────────────────────────────────────────────────
const packSchema = z.object({
  name: z.string().min(1),
  priceEur: z.number().positive(),
  units: z.number().int().positive(),
  bonusUnits: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.get('/packs', async (_req, res) => {
  const packs = await prisma.rechargePack.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(packs);
});

router.post('/packs', validate(packSchema), async (req, res) => {
  try {
    const pack = await prisma.rechargePack.create({ data: req.body });
    res.status(201).json(pack);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.put('/packs/:id', validate(packSchema.partial()), async (req, res) => {
  try {
    const pack = await prisma.rechargePack.update({ where: { id: req.params.id }, data: req.body });
    res.json(pack);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// ─── Users ──────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        card: { select: { balance: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  res.json({ total, page, limit, users });
});

// ─── Transactions ───────────────────────────────────────────────────────────
router.get('/transactions', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const [total, transactions] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        game: { select: { id: true, name: true } },
      },
    }),
  ]);
  res.json({ total, page, limit, transactions });
});

// ─── Games & Venues ─────────────────────────────────────────────────────────
const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/venues', async (_req, res) => {
  const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } });
  res.json(venues);
});

router.post('/venues', validate(venueSchema), async (req, res) => {
  try {
    const venue = await prisma.venue.create({ data: req.body });
    res.status(201).json(venue);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.put('/venues/:id', validate(venueSchema.partial()), async (req, res) => {
  try {
    const venue = await prisma.venue.update({ where: { id: req.params.id }, data: req.body });
    res.json(venue);
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.delete('/venues/:id', async (req, res) => {
  try {
    await prisma.venue.delete({ where: { id: req.params.id } });
    res.json({ message: 'VENUE_DELETED' });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

const gameSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  venueId: z.string().uuid(), // Single venue (will create GameVenue relation)
});

router.get('/games', async (_req, res) => {
  const games = await prisma.game.findMany({
    include: { venues: { include: { venue: true } } },
    orderBy: { name: 'asc' },
  });
  // Transform to match frontend expectation (single venue)
  const transformed = games.map((g) => ({
    ...g,
    venue: g.venues[0]?.venue || null,
    type: g.category || 'OTHER',
  }));
  res.json(transformed);
});

router.post('/games', validate(gameSchema), async (req, res) => {
  try {
    const { venueId, type, ...data } = req.body;
    const game = await prisma.game.create({
      data: {
        ...data,
        category: type,
        venues: venueId ? { create: { venueId } } : undefined,
      },
      include: { venues: { include: { venue: true } } },
    });
    res.status(201).json({
      ...game,
      venue: game.venues[0]?.venue || null,
      type: game.category,
    });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.put('/games/:id', validate(gameSchema.partial()), async (req, res) => {
  try {
    const { venueId, type, ...data } = req.body;
    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(type && { category: type }),
        ...(venueId !== undefined && {
          venues: {
            deleteMany: {},
            create: { venueId },
          },
        }),
      },
      include: { venues: { include: { venue: true } } },
    });
    res.json({
      ...game,
      venue: game.venues[0]?.venue || null,
      type: game.category,
    });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

router.delete('/games/:id', async (req, res) => {
  try {
    await prisma.game.delete({ where: { id: req.params.id } });
    res.json({ message: 'GAME_DELETED' });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, monthlyTransactions, allCards, totalTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.findMany({
        where: { type: 'RECHARGE', createdAt: { gte: startOfMonth } },
        include: { user: true },
      }),
      prisma.card.findMany({ select: { balance: true } }),
      prisma.transaction.count(),
    ]);

    // Calculate monthly revenue from recharges (EUR)
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => {
      // From amount in units, find corresponding pack price (approximation)
      return sum + (t.amount / 100); // Simple approximation: 100 units = 1 EUR
    }, 0);

    const totalBalance = allCards.reduce((sum, card) => sum + card.balance, 0);

    res.json({
      totalUsers,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      totalTransactions,
      totalBalance,
    });
  } catch {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
