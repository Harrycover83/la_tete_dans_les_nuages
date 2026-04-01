/**
 * Constantes métier pour le flow de réservation de session TDLN
 * Basées sur le système de réservation du site officiel
 * Zéro magic string — toutes les valeurs métier sont ici
 */

// ─── Types d'événements réservables ─────────────────────────────────────────

export interface EventType {
  id: string;
  label: string;
  description: string;
  icon: string;
  minParticipants: number;
  maxParticipants: number;
  hasFormula: boolean;
  hasCake: boolean;
}

export const EVENT_TYPES: EventType[] = [
  {
    id: 'birthday_kids',
    label: 'Anniversaires enfants',
    description: 'De 3 à 15 ans',
    icon: '🎂',
    minParticipants: 2,
    maxParticipants: 20,
    hasFormula: true,
    hasCake: true,
  },
  {
    id: 'vr_session',
    label: 'Séance VR',
    description: 'Expérience réalité virtuelle',
    icon: '🥽',
    minParticipants: 1,
    maxParticipants: 10,
    hasFormula: false,
    hasCake: false,
  },
  {
    id: 'gaming_tournament',
    label: 'Tournoi gaming',
    description: 'Compétition entre joueurs',
    icon: '🎮',
    minParticipants: 4,
    maxParticipants: 16,
    hasFormula: false,
    hasCake: false,
  },
  {
    id: 'private_party',
    label: 'Soirée privée',
    description: 'Événement privatisé',
    icon: '🎉',
    minParticipants: 10,
    maxParticipants: 50,
    hasFormula: false,
    hasCake: false,
  },
];

// ─── Formules (anniversaires) ────────────────────────────────────────────────

export interface Formula {
  id: string;
  name: string;
  pricePerPerson: number;
  duration: number; // minutes
  bonusUnits: number;
  highlights: string[];
  badge?: string;
}

export const FORMULAS: Formula[] = [
  {
    id: 'classique',
    name: 'Formule Anniversaire Classique',
    pricePerPerson: 24.95,
    duration: 60,
    bonusUnits: 0,
    highlights: [
      'Un créneau d\'1h en salle de jeux',
      'Accès à tous les jeux disponibles',
      'Invitations personnalisées',
    ],
  },
  {
    id: 'deluxe',
    name: 'Formule Anniversaire Deluxe',
    pricePerPerson: 34.95,
    duration: 90,
    bonusUnits: 100,
    badge: 'FORMULE DELUXE',
    highlights: [
      'Un créneau de 1h30 avec mise à disposition d\'une de nos tables',
      'Une carte de 100 unités bonus* par enfant',
      'Un gâteau au choix',
      'Des boissons : eau, jus de fruits, soda',
      'Un sachet de bonbons individuel',
      'Un cadeau surprise pour l\'enfant qui fête son anniversaire',
    ],
  },
  {
    id: 'premium',
    name: 'Formule Anniversaire Premium',
    pricePerPerson: 49.95,
    duration: 120,
    bonusUnits: 200,
    highlights: [
      'Un créneau de 2h avec salle privatisée',
      'Une carte de 200 unités bonus* par enfant',
      'Un gâteau au choix + décoration',
      'Repas complet inclus',
      'Animateur dédié',
      'Cadeau surprise premium',
    ],
  },
];

// ─── Gâteaux ──────────────────────────────────────────────────────────────────

export interface Cake {
  id: string;
  name: string;
  description: string;
  allergens: string[];
}

export const CAKES: Cake[] = [
  {
    id: 'moelleux_chocolat',
    name: 'Moelleux au Chocolat',
    description: 'Plongez dans le plaisir pur avec notre irrésistible moelleux au chocolat. Un délice fondant à savourer sans modération ! 🍫',
    allergens: ['Gluten', 'Lait de vache', 'Œuf', 'Soja', 'Traces possibles de fruits à coque'],
  },
  {
    id: 'tarte_pommes',
    name: 'Tarte aux Pommes',
    description: 'Découvrez l\'authentique saveur de la tarte aux pommes dans chaque bouchée de notre délicieuse création !',
    allergens: ['Gluten', 'Lait de vache', 'Œuf'],
  },
];

// ─── Créneaux horaires ────────────────────────────────────────────────────────

export const TIME_SLOTS: string[] = [
  '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:15', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

// ─── Étapes du flow ──────────────────────────────────────────────────────────

export const BOOKING_STEPS = {
  VENUE: 'VENUE',
  EVENT_TYPE: 'EVENT_TYPE',
  PARTICIPANTS_DATE: 'PARTICIPANTS_DATE',
  TIME_SLOT: 'TIME_SLOT',
  FORMULA: 'FORMULA',
  CAKE: 'CAKE',
  RECAP: 'RECAP',
} as const;

export type BookingStep = typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS];
