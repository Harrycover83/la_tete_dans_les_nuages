/**
 * Design tokens — La Tête Dans Les Nuages
 * Inspirée de la charte graphique officielle (latetedanslesnuages.com)
 * Univers neon/arcade sur fond sombre
 */

export const COLORS = {
  // === Fonds ===
  background: {
    /** Fond principal — bleu cobalt vibrant (dominant sur le site officiel) */
    primary: '#1B1C72',
    /** Fond secondaire — violet nuit profond (cartes, sections profondes) */
    secondary: '#0B022E',
    /** Fond carte / surface élevée */
    card: '#12063E',
    /** Fond overlay (modales) */
    overlay: 'rgba(11, 2, 46, 0.92)',
  },

  // === Couleurs d'accent (neon) ===
  neon: {
    /** Cyan électrique — couleur principale d'accent */
    cyan: '#00D3FF',
    /** Cyan clair */
    cyanLight: '#48F4FF',
    /** Rose/pink neon */
    pink: '#FE53BB',
    /** Jaune/or — tickets, scores, récompenses */
    yellow: '#FFC700',
    /** Jaune vif */
    yellowBright: '#FFE81C',
    /** Orange — boutons CTA outlined (style site officiel) */
    orange: '#FF6B35',
  },

  // === Marque ===
  brand: {
    /** Couleur primaire — cyan neon */
    primary: '#00D3FF',
    /** Couleur secondaire — rose neon */
    secondary: '#FE53BB',
    /** Couleur accentuation — jaune/or */
    accent: '#FFC700',
  },

  // === Textes ===
  text: {
    /** Texte principal sur fond sombre */
    primary: '#FFFFFF',
    /** Texte secondaire / muted */
    secondary: 'rgba(255, 255, 255, 0.65)',
    /** Texte désactivé */
    disabled: 'rgba(255, 255, 255, 0.3)',
    /** Texte sur fond clair (boutons jaunes) */
    onLight: '#0B022E',
  },

  // === Statuts ===
  status: {
    success: '#2FBE2C',
    error: '#E73434',
    warning: '#FFC700',
    info: '#2F97ED',
  },

  // === Bordures ===
  border: {
    default: 'rgba(255, 255, 255, 0.12)',
    neon: 'rgba(0, 211, 255, 0.4)',
    focus: '#00D3FF',
  },

  // === Utilitaires ===
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = typeof COLORS;
