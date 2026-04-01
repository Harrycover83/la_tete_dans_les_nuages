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

  // Create venues (with real GPS coordinates from TDLN locations)
  const venue1 = await prisma.venue.upsert({
    where: { id: 'venue-paris-levallois' },
    update: { latitude: 48.8975, longitude: 2.2930, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Interieur.png' },
    create: {
      id: 'venue-paris-levallois',
      name: 'TDLN Paris Levallois',
      address: '25 Rue Louis Rouquier',
      city: 'Levallois-Perret',
      phone: '01 47 57 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Interieur.png',
      latitude: 48.8975,
      longitude: 2.2930,
      isActive: true,
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { id: 'venue-paris-issy' },
    update: { latitude: 48.8280, longitude: 2.2720, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/couv-sept.png' },
    create: {
      id: 'venue-paris-issy',
      name: 'TDLN Paris Issy',
      address: '12 Rue Ernest Renan',
      city: 'Issy-les-Moulineaux',
      phone: '01 46 48 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/couv-sept.png',
      latitude: 48.8280,
      longitude: 2.2720,
      isActive: true,
    },
  });

  const venue3 = await prisma.venue.upsert({
    where: { id: 'venue-paris-est' },
    update: { latitude: 48.9055, longitude: 2.5090, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-5.png' },
    create: {
      id: 'venue-paris-est',
      name: 'TDLN Paris Est',
      address: '3 Avenue du Maréchal Foch',
      city: 'Noisy-le-Grand',
      phone: '01 48 15 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-5.png',
      latitude: 48.9055,
      longitude: 2.5090,
      isActive: true,
    },
  });

  const venue4 = await prisma.venue.upsert({
    where: { id: 'venue-paris-sud' },
    update: { latitude: 48.6143, longitude: 2.4848, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/slider-4.png' },
    create: {
      id: 'venue-paris-sud',
      name: 'TDLN Paris Sud',
      address: '8 Boulevard Jean Jaurès',
      city: 'Corbeil-Essonnes',
      phone: '01 60 88 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/slider-4.png',
      latitude: 48.6143,
      longitude: 2.4848,
      isActive: true,
    },
  });

  const venue5 = await prisma.venue.upsert({
    where: { id: 'venue-paris-ouest' },
    update: { latitude: 48.8989, longitude: 2.0944, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-6.png' },
    create: {
      id: 'venue-paris-ouest',
      name: 'TDLN Saint-Germain-en-Laye',
      address: '14 Rue au Pain',
      city: 'Saint-Germain-en-Laye',
      phone: '01 39 21 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-6.png',
      latitude: 48.8989,
      longitude: 2.0944,
      isActive: true,
    },
  });

  const venue6 = await prisma.venue.upsert({
    where: { id: 'venue-lyon-croix-rousse' },
    update: { latitude: 45.7748, longitude: 4.8265, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil2-10.png' },
    create: {
      id: 'venue-lyon-croix-rousse',
      name: 'TDLN Lyon Croix-Rousse',
      address: '18 Boulevard de la Croix-Rousse',
      city: 'Lyon',
      phone: '04 78 28 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil2-10.png',
      latitude: 45.7748,
      longitude: 4.8265,
      isActive: true,
    },
  });

  const venue7 = await prisma.venue.upsert({
    where: { id: 'venue-lyon-ouest' },
    update: { latitude: 45.7480, longitude: 4.8007, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil7-4.png' },
    create: {
      id: 'venue-lyon-ouest',
      name: 'TDLN Lyon Ouest',
      address: '5 Place Charlemagne',
      city: 'Lyon',
      phone: '04 78 36 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil7-4.png',
      latitude: 45.7480,
      longitude: 4.8007,
      isActive: true,
    },
  });

  const venue8 = await prisma.venue.upsert({
    where: { id: 'venue-nice' },
    update: { latitude: 43.7102, longitude: 7.2620, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil2-11.png' },
    create: {
      id: 'venue-nice',
      name: 'TDLN Nice',
      address: '2 Avenue Jean Médecin',
      city: 'Nice',
      phone: '04 93 16 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil2-11.png',
      latitude: 43.7102,
      longitude: 7.2620,
      isActive: true,
    },
  });

  const venue9 = await prisma.venue.upsert({
    where: { id: 'venue-toulon' },
    update: { latitude: 43.1242, longitude: 5.9280, imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-0-2.png' },
    create: {
      id: 'venue-toulon',
      name: 'TDLN Toulon',
      address: '7 Avenue Colbert',
      city: 'Toulon',
      phone: '04 94 09 XX XX',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-0-2.png',
      latitude: 43.1242,
      longitude: 5.9280,
      isActive: true,
    },
  });

  console.log('✅ Venues created');

  // Aliases for game associations
  const venueParisMain = venue1;
  const venueLyonMain = venue6;

  // Create games
  const game1 = await prisma.game.upsert({
    where: { id: 'game-vr-space' },
    update: {},
    create: {
      id: 'game-vr-space',
      name: 'VR Space Explorer',
      description: 'Explorez l\'espace en réalité virtuelle',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-2-2.png',
      category: 'VR',
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  const game2 = await prisma.game.upsert({
    where: { id: 'game-racing' },
    update: {},
    create: {
      id: 'game-racing',
      name: 'Turbo Racing Arcade',
      description: 'Course de voitures arcade frénétique',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Arcade-Accueil-2-1.png',
      category: 'RACING',
      venues: { create: [{ venueId: venueParisMain.id }] },
    },
  });

  const game3 = await prisma.game.upsert({
    where: { id: 'game-zombie-vr' },
    update: {},
    create: {
      id: 'game-zombie-vr',
      name: 'Zombie Apocalypse VR',
      description: 'Survivez à l\'apocalypse zombie en VR',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-1-1.png',
      category: 'VR',
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  const game4 = await prisma.game.upsert({
    where: { id: 'game-dance' },
    update: {},
    create: {
      id: 'game-dance',
      name: 'Dance Revolution Pro',
      description: 'Dansez sur les meilleurs hits',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil2-11.png',
      category: 'DANCE',
      venues: { create: [{ venueId: venueLyonMain.id }] },
    },
  });

  console.log('✅ Games created');

  // Supprimer les anciens packs (anciennes IDs)
  await prisma.rechargePack.deleteMany({
    where: { id: { in: ['pack-starter', 'pack-fun', 'pack-premium'] } },
  });

  // Create recharge packs — données exactes des bornes en salle
  await prisma.rechargePack.upsert({
    where: { id: 'pack-10' },
    update: { name: '24 unités', priceEur: 10, units: 24, bonusUnits: 0, sortOrder: 1 },
    create: { id: 'pack-10', name: '24 unités', priceEur: 10, units: 24, bonusUnits: 0, isActive: true, sortOrder: 1 },
  });
  await prisma.rechargePack.upsert({
    where: { id: 'pack-20' },
    update: { name: '53 unités', priceEur: 20, units: 48, bonusUnits: 5, sortOrder: 2 },
    create: { id: 'pack-20', name: '53 unités', priceEur: 20, units: 48, bonusUnits: 5, isActive: true, sortOrder: 2 },
  });
  await prisma.rechargePack.upsert({
    where: { id: 'pack-30' },
    update: { name: '87 unités', priceEur: 30, units: 72, bonusUnits: 15, sortOrder: 3 },
    create: { id: 'pack-30', name: '87 unités', priceEur: 30, units: 72, bonusUnits: 15, isActive: true, sortOrder: 3 },
  });
  await prisma.rechargePack.upsert({
    where: { id: 'pack-50' },
    update: { name: '160 unités', priceEur: 50, units: 120, bonusUnits: 40, sortOrder: 4 },
    create: { id: 'pack-50', name: '160 unités', priceEur: 50, units: 120, bonusUnits: 40, isActive: true, sortOrder: 4 },
  });
  await prisma.rechargePack.upsert({
    where: { id: 'pack-75' },
    update: { name: '250 unités', priceEur: 75, units: 180, bonusUnits: 70, sortOrder: 5 },
    create: { id: 'pack-75', name: '250 unités', priceEur: 75, units: 180, bonusUnits: 70, isActive: true, sortOrder: 5 },
  });
  await prisma.rechargePack.upsert({
    where: { id: 'pack-100' },
    update: { name: '340 unités', priceEur: 100, units: 240, bonusUnits: 100, sortOrder: 6 },
    create: { id: 'pack-100', name: '340 unités', priceEur: 100, units: 240, bonusUnits: 100, isActive: true, sortOrder: 6 },
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
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: demoUser.id, badgeId: badge1.id } },
    update: {},
    create: {
      userId: demoUser.id,
      badgeId: badge1.id,
    },
  });
  console.log('✅ Badge awarded to demo user');

  console.log('✅ Recharge packs created');

  // Create sample articles
  await prisma.article.upsert({
    where: { id: 'article-welcome' },
    update: { coverImage: 'news-welcome.jpg' },
    create: {
      id: 'article-welcome',
      title: 'Bienvenue chez Tête dans les Nuages !',
      coverImage: 'news-welcome.jpg',
      body: `# Bienvenue !\n\nNous sommes ravis de vous accueillir dans notre réseau de salles de divertissement.\n\nDécouvrez nos jeux immersifs, rechargez votre carte et vivez des expériences inoubliables.\n\n## Comment ça marche ?\n\n1. Rechargez votre carte virtuelle\n2. Scannez votre QR code à la borne\n3. Jouez et amusez-vous !\n\nÀ bientôt dans nos salles ☁️`,
      category: 'NEWS',
      isPinned: true,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-promo-xp' },
    update: { coverImage: 'carte-cadeau.jpg' },
    create: {
      id: 'article-promo-xp',
      title: 'Double XP ce week-end !',
      coverImage: 'carte-cadeau.jpg',
      body: `## 🎉 Week-end Double XP !\n\nCe week-end, gagnez **2x plus d'XP** sur tous les jeux !\n\nC'est le moment parfait pour grimper dans les classements et débloquer de nouveaux badges.\n\n📅 Valable du vendredi 18h au dimanche 23h59`,
      category: 'PROMOTION',
      isPinned: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-tournoi' },
    update: { coverImage: 'vr-coaster.jpg' },
    create: {
      id: 'article-tournoi',
      title: 'Tournoi VR Space Explorer - Inscription ouverte',
      coverImage: 'vr-coaster.jpg',
      body: `## 🏆 Grand Tournoi VR Space Explorer\n\nInscrivez-vous au tournoi mensuel !\n\n**Lot :** 500 unités pour le gagnant\n\n**Date :** 15 avril 2026\n\nInscription gratuite sur place.`,
      category: 'EVENT',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-saint-valentin' },
    update: { coverImage: 'saint-valentin.jpg' },
    create: {
      id: 'article-saint-valentin',
      title: 'Saint-Valentin : vivez une expérience unique en couple !',
      coverImage: 'saint-valentin.jpg',
      body: `## 💑 Saint-Valentin à La Tête Dans Les Nuages\n\nOffrez à votre moitié une soirée inoubliable dans nos salles immersives.\n\nPour la Saint-Valentin, profitez d'offres spéciales en duo : **-20% sur nos packs couple** et accès prioritaire à nos expériences VR exclusives.\n\n📅 Du 10 au 16 février\n\nReservation conseillée.`,
      category: 'PROMOTION',
      isPinned: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-familles' },
    update: { coverImage: 'families.jpg' },
    create: {
      id: 'article-familles',
      title: 'Les vacances en famille, c\'est chez nous !',
      coverImage: 'families.jpg',
      body: `## 👨‍👩‍👧‍👦 Sorties en famille\n\nLa Tête Dans Les Nuages, c'est le lieu idéal pour des sorties en famille !\n\nDes jeux adaptés à tous les âges, des espaces sécurisés et des animateurs disponibles toute la journée.\n\n**Accès dès 4 ans.** Tarifs réduits pour les moins de 10 ans.`,
      category: 'NEWS',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-carte-cadeau' },
    update: { coverImage: 'carte-cadeau.jpg' },
    create: {
      id: 'article-carte-cadeau',
      title: 'Offrez la magie TDLN avec nos Cartes Cadeaux !',
      coverImage: 'carte-cadeau.jpg',
      body: `## 🎁 Cartes Cadeaux TDLN\n\nVous cherchez un cadeau original ? Nos **cartes cadeaux** sont disponibles en salle et en ligne.\n\nDes montants de 10€, 20€, 50€ et 100€ pour offrir des moments inoubliables.\n\nValables 1 an dans toutes nos salles.`,
      category: 'PROMOTION',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-noel' },
    update: { coverImage: 'vr-attraction.jpg' },
    create: {
      id: 'article-noel',
      title: 'Noël à La Tête Dans Les Nuages',
      coverImage: 'vr-attraction.jpg',
      body: `## 🎄 Les fêtes de fin d'année chez TDLN\n\nCélébrez Noël et le Nouvel An dans une ambiance magique et festive !\n\nAnimations spéciales, décorations féeriques et surprises pour petits et grands.\n\n📅 Programme de décembre disponible en salle.`,
      category: 'EVENT',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-nouvelle-salle' },
    update: { coverImage: 'nouvelle-salle.jpg' },
    create: {
      id: 'article-nouvelle-salle',
      title: 'Nouvelle salle : on agrandit la famille TDLN !',
      coverImage: 'nouvelle-salle.jpg',
      body: `## 🏗️ Une nouvelle salle ouvre ses portes\n\nLa famille TDLN continue de grandir ! Une nouvelle salle ultra-moderne rejoint notre réseau.\n\nJeux inédits, technologie de pointe et une nouvelle équipe passionnée pour vous accueillir.\n\n📍 Venez découvrir l'adresse lors de l'inauguration !`,
      category: 'NEWS',
      isPinned: false,
      venues: { create: [{ venueId: venue8.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-laser-game' },
    update: { coverImage: 'laser-game.jpg' },
    create: {
      id: 'article-laser-game',
      title: 'Laser Game : plongez dans l\'arène !',
      coverImage: 'laser-game.jpg',
      body: `## 🎯 Le Laser Game TDLN\n\nÉquipez-vous, entrez dans l'arène et affrontez vos amis dans nos décors fluorescents ultra-immersifs.\n\nDeux modes de jeu : solo ou en équipe. À partir de 6 ans.\n\n📍 Disponible dans nos salles de Paris La Défense, Aéroville, Plaisir et Toulon.`,
      category: 'NEWS',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-arcade' },
    update: { coverImage: 'arcade-pacman.jpg' },
    create: {
      id: 'article-arcade',
      title: 'Bornes d\'arcade : retrogaming & sensations',
      coverImage: 'arcade-pacman.jpg',
      body: `## 🕹️ L'espace Arcade TDLN\n\nDes dizaines de bornes iconiques vous attendent : Pac-Man, Mario Kart, simulateurs de course, jeux de tir…\n\nSeul, en famille ou entre amis — chaque visite est une nouvelle aventure.\n\nDécouvrez nos FreePlay pour jouer en illimité !`,
      category: 'NEWS',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-vr-hurricane' },
    update: { coverImage: 'kids-vr.jpg' },
    create: {
      id: 'article-vr-hurricane',
      title: 'Hurricane VR : le grand huit à 360° !',
      coverImage: 'kids-vr.jpg',
      body: `## 🌀 Hurricane VR — Sensations extrêmes\n\nAttachez vos ceintures ! Notre simulateur Hurricane VR vous embarque dans des rotations complètes à 360°.\n\nMontagnes russes, vols de dragons… chaque virage se ressent physiquement.\n\nDisponible à Paris Opéra, Aéroville, Carré Sénart, Lyon et Nice.`,
      category: 'NEWS',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
    },
  });

  await prisma.article.upsert({
    where: { id: 'article-sport' },
    update: { coverImage: 'basketball.jpg' },
    create: {
      id: 'article-sport',
      title: 'Défi sportif : basketball, air hockey et plus !',
      coverImage: 'basketball.jpg',
      body: `## 🏀 Jeux de sport & adresse\n\nTestez votre adresse sur nos machines sportives : basketball Sega, air hockey, bornes de boxe…\n\nCompétez avec vos amis et vérifiez qui a le meilleur bras !\n\nAccessible dès 4 ans.`,
      category: 'EVENT',
      isPinned: false,
      venues: { create: [{ venueId: venueParisMain.id }, { venueId: venueLyonMain.id }] },
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
  await prisma.leaderboardEntry.upsert({
    where: { userId_gameId: { userId: user2.id, gameId: game1.id } },
    update: {},
    create: { userId: user2.id, gameId: game1.id, maxScore: 3200, totalXp: 42 },
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId_gameId: { userId: demoUser.id, gameId: game1.id } },
    update: {},
    create: { userId: demoUser.id, gameId: game1.id, maxScore: 1250, totalXp: 60 },
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId_gameId: { userId: user3.id, gameId: game1.id } },
    update: {},
    create: { userId: user3.id, gameId: game1.id, maxScore: 1900, totalXp: 29 },
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId_gameId: { userId: user2.id, gameId: game2.id } },
    update: {},
    create: { userId: user2.id, gameId: game2.id, maxScore: 1800, totalXp: 28 },
  });

  console.log('✅ Leaderboard entries created');

  // Create events
  const now = new Date();
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000);

  await prisma.event.upsert({
    where: { id: 'event-nuit-vr-paris' },
    update: { imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/couv-sept.png' },
    create: {
      id: 'event-nuit-vr-paris',
      title: 'Nuit VR Spéciale',
      description: 'Une soirée exceptionnelle dédiée à la réalité virtuelle. Accès illimité à tous nos casques VR de 20h à minuit.',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/couv-sept.png',
      startDate: addDays(7),
      endDate: addDays(7),
      venueId: venueParisMain.id,
      maxCapacity: 40,
      priceUnits: 0,
      isActive: true,
    },
  });

  await prisma.event.upsert({
    where: { id: 'event-tournoi-racing' },
    update: { imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Arcade-Accueil-2-1.png' },
    create: {
      id: 'event-tournoi-racing',
      title: 'Tournoi Turbo Racing',
      description: 'Affrontez les meilleurs pilotes de la région ! Prix à gagner pour le top 3.',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Arcade-Accueil-2-1.png',
      startDate: addDays(14),
      endDate: addDays(14),
      venueId: venueParisMain.id,
      maxCapacity: 32,
      priceUnits: 0,
      isActive: true,
    },
  });

  await prisma.event.upsert({
    where: { id: 'event-anniversary-lyon' },
    update: { imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Interieur.png' },
    create: {
      id: 'event-anniversary-lyon',
      title: 'Anniversaire TDLN Lyon',
      description: 'Célébrons 3 ans de la salle TDLN Lyon avec des animations, des jeux en accès libre et des surprises !',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/Interieur.png',
      startDate: addDays(10),
      endDate: addDays(10),
      venueId: venueLyonMain.id,
      maxCapacity: 60,
      priceUnits: 0,
      isActive: true,
    },
  });

  await prisma.event.upsert({
    where: { id: 'event-zombie-challenge' },
    update: { imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-1-1.png' },
    create: {
      id: 'event-zombie-challenge',
      title: 'Zombie VR Challenge',
      description: 'Formez votre équipe et survivez le plus longtemps possible dans notre expérience zombie VR en coopération.',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/vignette-accueil-copy-1-1.png',
      startDate: addDays(21),
      endDate: addDays(21),
      venueId: venue6.id,
      maxCapacity: 20,
      priceUnits: 0,
      isActive: true,
    },
  });

  await prisma.event.upsert({
    where: { id: 'event-nice-opening' },
    update: { imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/slider-4.png' },
    create: {
      id: 'event-nice-opening',
      title: 'Inauguration TDLN Nice',
      description: 'Venez découvrir notre toute nouvelle salle sur la Côte d\'Azur ! Entrée gratuite, démonstrations et jeux en accès libre.',
      imageUrl: 'https://latetedanslesnuages.com/wp-content/uploads/slider-4.png',
      startDate: addDays(5),
      endDate: addDays(5),
      venueId: venue8.id,
      maxCapacity: 80,
      priceUnits: 0,
      isActive: true,
    },
  });

  console.log('✅ Events created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
