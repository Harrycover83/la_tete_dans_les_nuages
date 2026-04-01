import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import * as cardController from '../controllers/card.controller';
import { z } from 'zod';

const router = Router();

router.get('/me', authenticate, cardController.getMyCard);

router.post(
  '/debit',
  validate(
    z.object({
      cardId: z.string().uuid(),
      amount: z.number().positive(),
      description: z.string().optional(),
      gameId: z.string().optional(),
      machineId: z.string().optional(),
    })
  ),
  cardController.debit
);

router.get('/transactions', authenticate, cardController.getTransactions);

router.get('/wallet-pass', authenticate, cardController.getWalletPass);

export default router;
