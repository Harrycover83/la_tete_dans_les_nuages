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

  const game2 = await prisma.game.upsert({
    where: { id: 'game-racing' },
    update: {},
    create: {
      id: 'game-racing',
      name: 'Turbo Racing Arcade',
      description: 'Course de voitures arcade frénétique',
      category: 'RACING',
      venues: { create: [{ venueId: venue1.id }] },
    },
  });

  const game3 = await prisma.game.upsert({
    where: { id: 'game-zombie-vr' },
    update: {},
    create: {
      id: 'game-zombie-vr',
      name: 'Zombie Apocalypse VR',
      description: 'Survivez à l\'apocalypse zombie en VR',
      category: 'VR',
      venues: { create: [{ venueId: venue1.id }, { venueId: venue2.id }] },
    },
  });

  const game4 = await prisma.game.upsert({
    where: { id: 'game-dance' },
    update: {},
    create: {
      id: 'game-dance',
      name: 'Dance Revolution Pro',
      description: 'Dansez sur les meilleurs hits',
      category: 'DANCE',
      venues: { create: [{ venueId: venue2.id }] },
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

  // Create badges
  const badge1 = await prisma.badge.upsert({
    where: { id: 'badge-first-play' },
    update: {},
    create: {
      id: 'badge-first-play',
      name: 'Première Partie',
      description: 'Joué à votre premier jeu',
      iconUrl: '/badges/first-play.png',
    },
  });

  const badge2 = await prisma.badge.upsert({
    where: { id: 'badge-high-score' },
    update: {},
    create: {
      id: 'badge-high-score',
      name: 'Maître du Score',
      description: 'Atteint un score de 1000+',
      iconUrl: '/badges/high-score.png',
    },
  });

  const badge3 = await prisma.badge.upsert({
    where: { id: 'badge-vr-master' },
    update: {},
    create: {
      id: 'badge-vr-master',
      name: 'Expert VR',
      description: 'Joué à 10 jeux VR',
      iconUrl: '/badges/vr-master.png',
    },
  });
  console.log('✅ Badges created');

  // Create additional users
  const user2Hash = await bcrypt.hash('User1234!', 12);
  const user2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash: user2Hash,
      firstName: 'Alice',
      lastName: 'Martin',
      emailVerified: true,
      card: { create: { balance: 250 } },
    },
  });

  const user3Hash = await bcrypt.hash('User1234!', 12);
  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash: user3Hash,
      firstName: 'Bob',
      lastName: 'Dupont',
      emailVerified: true,
      card: { create: { balance: 80 } },
    },
  });
  console.log('✅ Additional users created');

  // Award badge to demo user
  await prisma.userBadge.create({
    data: {
      userId: demoUser.id,
      badgeId: badge1.id,
    },
  });
  console.log('✅ Badge awarded to demo user');

  console.log('✅ Recharge packs created');

  // Create sample articles
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

  await prisma.article.upsert({
    where: { id: 'article-promo-xp' },
    update: {},
    create: {
      id: 'article-promo-xp',
      title: 'Double XP ce week-end !',
      body: `## 🎉 Week-end Double XP !\n\nCe week-end, gagnez **2x plus d'XP** sur tous les jeux !\n\nC'est le moment parfait pour grimper dans les classements et débloquer de nouveaux badges.\n\n📅 Valable du vendredi 18h au dimanche 23h59`,
      category: 'PROMOTION',
      isPinned: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expire dans 7 jours
      venues: { create: [{ venueId: venue1.id }, { venueId: venue2.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-tournoi' },
    update: {},
    create: {
      id: 'article-tournoi',
      title: 'Tournoi VR Space Explorer - Inscription ouverte',
      body: `## 🏆 Grand Tournoi VR Space Explorer\n\nInscrivez-vous au tournoi mensuel !\n\n**Lot :** 500 unités pour le gagnant\n\n**Date :** 15 avril 2026\n\nInscription gratuite sur place.`,
      category: 'EVENT',
      isPinned: false,
      venues: { create: [{ venueId: venue1.id }] },
    },
  });
  console.log('✅ Sample articles created');

  // Create sample game sessions and transactions
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

  await prisma.gameSession.create({
    data: {
      userId: demoUser.id,
      gameId: game3.id,
      score: 2800,
      duration: 450,
      xpEarned: 38,
    },
  });

  // Game sessions for alice
  await prisma.gameSession.create({
    data: {
      userId: user2.id,
      gameId: game1.id,
      score: 3200,
      duration: 400,
      xpEarned: 42,
    },
  });

  await prisma.gameSession.create({
    data: {
      userId: user2.id,
      gameId: game2.id,
      score: 1800,
      duration: 250,
      xpEarned: 28,
    },
  });

  // Game sessions for bob
  await prisma.gameSession.create({
    data: {
      userId: user3.id,
      gameId: game1.id,
      score: 1900,
      duration: 350,
      xpEarned: 29,
    },
  });

  console.log('✅ Sample game sessions created');

  // Create leaderboard entries
  await prisma.leaderboardEntry.create({
    data: {
      userId: user2.id,
      gameId: game1.id,
      maxScore: 3200,
      totalXp: 42,
    },
  });

  await prisma.leaderboardEntry.create({
    data: {
      userId: demoUser.id,
      gameId: game1.id,
      maxScore: 1250,
      totalXp: 60,
    },
  });

  await prisma.leaderboardEntry.create({
    data: {
      userId: user3.id,
      gameId: game1.id,
      maxScore: 1900,
      totalXp: 29,
    },
  });

  await prisma.leaderboardEntry.create({
    data: {
      userId: user2.id,
      gameId: game2.id,
      maxScore: 1800,
      totalXp: 28,
    },
  });

  console.log('✅ Leaderboard entries created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
