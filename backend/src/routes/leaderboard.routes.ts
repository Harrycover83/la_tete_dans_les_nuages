import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import * as leaderboardController from '../controllers/leaderboard.controller';
import { z } from 'zod';

const router = Router();

router.get('/:gameId', leaderboardController.getLeaderboard);

router.post(
  '/game-session',
  authenticate,
  validate(
    z.object({
      gameId: z.string().uuid(),
      score: z.number().int().min(0),
      duration: z.number().int().min(0),
    })
  ),
  leaderboardController.recordGameSession
);

export default router;
