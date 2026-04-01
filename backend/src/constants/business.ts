/**
 * Constantes métier de l'application
 * Zéro magic number : toutes les valeurs métier sont nommées et documentées
 */
export const BUSINESS_CONSTANTS = {
  /** Durée de validité du refresh token en jours */
  REFRESH_TOKEN_VALIDITY_DAYS: 7,

  /** Durée de validité du token de réinitialisation de mot de passe en millisecondes (1 heure) */
  PASSWORD_RESET_TOKEN_VALIDITY_MS: 3600 * 1000,

  /** XP de base gagnés par session de jeu */
  XP_PER_SESSION: 10,

  /** Diviseur pour calculer le bonus XP basé sur le score (score / XP_SCORE_DIVISOR) */
  XP_SCORE_DIVISOR: 100,

  /** Score minimum pour déclencher le badge Maître du Score */
  BADGE_HIGH_SCORE_THRESHOLD: 1000,

  /** Nombre de sessions VR pour déclencher le badge Expert VR */
  BADGE_VR_MASTER_SESSIONS: 10,
} as const;
