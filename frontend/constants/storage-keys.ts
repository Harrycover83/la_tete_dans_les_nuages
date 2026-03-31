/**
 * Clés SecureStore / AsyncStorage — La Tête Dans Les Nuages
 * Ne jamais utiliser des chaînes en dur pour les clés de stockage
 */

export const STORAGE_KEYS = {
  /** JWT d'accès */
  ACCESS_TOKEN: 'ltdln_access_token',
  /** Token de rafraîchissement */
  REFRESH_TOKEN: 'ltdln_refresh_token',
  /** Données utilisateur mises en cache */
  USER_PROFILE: 'ltdln_user_profile',
  /** Préférence de langue */
  LANGUAGE: 'ltdln_language',
  /** Thème préféré (dark uniquement pour l'instant) */
  THEME: 'ltdln_theme',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
