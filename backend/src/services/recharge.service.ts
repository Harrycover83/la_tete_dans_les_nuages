import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { creditCard } from './card.service';
import { config } from '../utils/config';
import { ERROR_CODES } from '../constants/error-codes';

const stripe = new Stripe(config.STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' });

export async function getPacks() {
  return prisma.rechargePack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createPaymentIntent(userId: string, packId: string) {
  const pack = await prisma.rechargePack.findUnique({ where: { id: packId } });
  if (!pack) throw new Error(ERROR_CODES.PACK_NOT_FOUND);

  const amount = Math.round(pack.priceEur * 100); // cents
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { userId, packId },
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function handleStripeWebhook(body: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    config.STRIPE_WEBHOOK_SECRET ?? ''
  );

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { userId, packId } = pi.metadata;

    const pack = await prisma.rechargePack.findUnique({ where: { id: packId } });
    if (!pack) return;

    const totalUnits = pack.units + pack.bonusUnits;
    await creditCard(
      userId,
      totalUnits,
      `Recharge pack "${pack.name}" (${pack.units}${pack.bonusUnits > 0 ? ` + ${pack.bonusUnits} bonus` : ''} unités)`,
      pi.id
    );
  }
}
