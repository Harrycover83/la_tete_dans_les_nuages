import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as rechargeService from '../services/recharge.service';

export async function getPacks(_req: Request, res: Response) {
  try {
    const packs = await rechargeService.getPacks();
    res.json(packs);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function createPaymentIntent(req: AuthRequest, res: Response) {
  try {
    const { packId } = req.body;
    const result = await rechargeService.createPaymentIntent(req.userId!, packId);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'PACK_NOT_FOUND') {
      return res.status(404).json({ message: 'Pack de recharge non trouvé.' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  try {
    await rechargeService.handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ message: 'Webhook error' });
  }
}
