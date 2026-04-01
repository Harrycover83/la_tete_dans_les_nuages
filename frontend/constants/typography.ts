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

/**
 * Ombres de texte — liseret bleu ciel ultra-fin qui évoque les nuages.
 * S'applique en spread dans le `style` prop d'un <Text>.
 *
 * Exemple : <Text style={{ color: '#FFF', fontSize: 28, ...TEXT_SHADOW.cloudGlow }}>
 */
export const TEXT_SHADOW = {
  /** Liseret bleu ciel très fin — titres principaux (≥ 22 px) */
  cloudGlow: {
    textShadowColor: 'rgba(135, 206, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  /** Plus serré — sous-titres / textes md */
  cloudGlowSubtle: {
    textShadowColor: 'rgba(135, 206, 255, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1.5,
  },
  /** Fort — très grands affichages (≥ 40 px) */
  cloudGlowStrong: {
    textShadowColor: 'rgba(135, 206, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
} as const;
