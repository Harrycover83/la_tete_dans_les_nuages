/**
 * TTL (Time To Live) pour les entrées Redis, en secondes
 * Zéro magic number : tous les TTL sont des constantes nommées
 */
export const CACHE_TTL = {
  /** TTL pour le solde de la carte utilisateur (30 secondes) */
  CARD_BALANCE: 30,

  /** TTL pour le profil utilisateur complet (5 minutes) */
  USER_PROFILE: 300,

  /** TTL pour la liste des venues (10 minutes) */
  VENUES: 600,

  /** TTL pour la liste des événements à venir (2 minutes) */
  EVENTS: 120,

  /** TTL pour les réservations d'un utilisateur (1 minute) */
  USER_BOOKINGS: 60,

  /** TTL pour les réservations de session d'un utilisateur (2 minutes) */
  USER_SESSION_BOOKINGS: 120,
} as const;
