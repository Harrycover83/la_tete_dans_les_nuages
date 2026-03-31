/**
 * Routes Expo Router — La Tête Dans Les Nuages
 * Centralise tous les noms de routes pour éviter les magic strings
 */

export const ROUTES = {
  // Auth
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  RESET_PASSWORD: '/(auth)/reset-password',

  // Tabs
  HOME: '/(tabs)/home',
  CARD: '/(tabs)/card',
  RECHARGE: '/(tabs)/recharge',
  HISTORY: '/(tabs)/history',
  PROFILE: '/(tabs)/profile',

  // Article
  ARTICLE: (id: string) => `/article/${id}` as const,
} as const;
