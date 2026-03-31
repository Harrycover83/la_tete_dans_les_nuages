/**
 * Typographie — La Tête Dans Les Nuages
 * Polices et tailles standardisées
 */

export const FONT_FAMILY = {
  /** Police d'affichage / titres — à charger via expo-font */
  display: 'Exo2_700Bold',
  /** Police corps de texte */
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  /** Police mono (scores, compteurs) */
  mono: 'SpaceMono_400Regular',
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  display: 48,
} as const;

export const LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;
