/**
 * TTL (Time To Live) pour les entrées Redis, en secondes
 * Zéro magic number : tous les TTL sont des constantes nommées
 */
export const CACHE_TTL = {
  /** TTL pour le solde de la carte utilisateur (30 secondes) */
  CARD_BALANCE: 30,

  /** TTL pour le profil utilisateur complet (5 minutes) */
  USER_PROFILE: 300,
} as const;
