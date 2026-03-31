import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import * as rechargeController from '../controllers/recharge.controller';
import { z } from 'zod';

const router = Router();

router.get('/packs', rechargeController.getPacks);

router.post(
  '/payment-intent',
  authenticate,
  validate(z.object({ packId: z.string().uuid() })),
  rechargeController.createPaymentIntent
);

// Stripe webhook — raw body required (configured in index.ts)
router.post('/webhook', rechargeController.stripeWebhook);

export default router;
