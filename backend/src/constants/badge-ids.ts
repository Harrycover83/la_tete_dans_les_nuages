/**
 * Identifiants des badges — doivent correspondre aux IDs du seed
 * Ne jamais utiliser ces chaînes directement dans le code : toujours passer par cette constante
 */
export const BADGE_IDS = {
  /** Déclenché à la première partie jouée */
  FIRST_PLAY: 'badge-first-play',
  /** Déclenché quand le score atteint BADGE_HIGH_SCORE_THRESHOLD */
  HIGH_SCORE: 'badge-high-score',
  /** Déclenché après BADGE_VR_MASTER_SESSIONS sessions VR */
  VR_MASTER: 'badge-vr-master',
} as const;
