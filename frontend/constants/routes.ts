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
  VENUES: '/(tabs)/venues',
  PROFILE: '/(tabs)/profile',

  // Article
  ARTICLE: (id: string) => `/article/${id}` as const,

  // Profile sub-screens
  EDIT_PROFILE: '/profile/edit',
  NOTIFICATIONS: '/profile/notifications',
  SUPPORT: '/support',
} as const;
