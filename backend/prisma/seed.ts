import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tdln.fr' },
    update: {},
    create: {
      email: 'admin@tdln.fr',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'TDLN',
      emailVerified: true,
      role: 'ADMIN',
      card: { create: { balance: 0 } },
    },
  });
  console.log('✅ Admin user:', admin.email);

  // Create demo user
  const userHash = await bcrypt.hash('User1234!', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tdln.fr' },
    update: {},
    create: {
      email: 'demo@tdln.fr',
      passwordHash: userHash,
      firstName: 'Demo',
      lastName: 'Utilisateur',
      emailVerified: true,
      card: { create: { balance: 150 } },
    },
  });
  console.log('✅ Demo user:', demoUser.email);

  // Create venues
  const venue1 = await prisma.venue.upsert({
    where: { id: 'venue-paris' },
    update: {},
    create: {
      id: 'venue-paris',
      name: 'TDLN Paris',
      address: '10 Rue de la Paix',
      city: 'Paris',
      isActive: true,
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { id: 'venue-lyon' },
    update: {},
    create: {
      id: 'venue-lyon',
      name: 'TDLN Lyon',
      address: '5 Place Bellecour',
      city: 'Lyon',
      isActive: true,
    },
  });
  console.log('✅ Venues created');

  // Create games
  const game1 = await prisma.game.upsert({
    where: { id: 'game-vr-space' },
    update: {},
    create: {
      id: 'game-vr-space',
      name: 'VR Space Explorer',
      description: 'Explorez l\'espace en réalité virtuelle',
      category: 'VR',
      venues: { create: [{ venueId: venue1.id }, { venueId: venue2.id }] },
    },
  });
  console.log('✅ Games created');

  // Create recharge packs
  await prisma.rechargePack.upsert({
    where: { id: 'pack-starter' },
    update: {},
    create: {
      id: 'pack-starter',
      name: 'Pack Starter',
      priceEur: 10,
      units: 100,
      bonusUnits: 0,
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.rechargePack.upsert({
    where: { id: 'pack-fun' },
    update: {},
    create: {
      id: 'pack-fun',
      name: 'Pack Fun',
      priceEur: 20,
      units: 200,
      bonusUnits: 20,
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.rechargePack.upsert({
    where: { id: 'pack-premium' },
    update: {},
    create: {
      id: 'pack-premium',
      name: 'Pack Premium',
      priceEur: 50,
      units: 500,
      bonusUnits: 100,
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log('✅ Recharge packs created');

  // Create sample article
  await prisma.article.upsert({
    where: { id: 'article-welcome' },
    update: {},
    create: {
      id: 'article-welcome',
      title: 'Bienvenue chez Tête dans les Nuages !',
      body: `# Bienvenue !\n\nNous sommes ravis de vous accueillir dans notre réseau de salles de divertissement.\n\nDécouvrez nos jeux immersifs, rechargez votre carte et vivez des expériences inoubliables.\n\n## Comment ça marche ?\n\n1. Rechargez votre carte virtuelle\n2. Scannez votre QR code à la borne\n3. Jouez et amusez-vous !\n\nÀ bientôt dans nos salles ☁️`,
      category: 'NEWS',
      isPinned: true,
      venues: { create: [{ venueId: venue1.id }, { venueId: venue2.id }] },
    },
  });
  console.log('✅ Sample article created');

  // Create a sample game session for demo user
  const demoCard = await prisma.card.findUnique({ where: { userId: demoUser.id } });
  if (demoCard) {
    await prisma.transaction.create({
      data: {
        type: 'RECHARGE',
        amount: 150,
        balanceAfter: 150,
        description: 'Recharge initiale de démonstration',
        userId: demoUser.id,
        cardId: demoCard.id,
      },
    });
  }

  await prisma.gameSession.create({
    data: {
      userId: demoUser.id,
      gameId: game1.id,
      score: 1250,
      duration: 300,
      xpEarned: 22,
    },
  });
  console.log('✅ Sample game session created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
