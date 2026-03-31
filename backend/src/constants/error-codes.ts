/**
 * Error codes utilisés dans toute l'application backend
 * Zéro magic string : chaque erreur métier est une constante exportée
 */
export const ERROR_CODES = {
  // Auth errors
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_OR_EXPIRED_TOKEN: 'INVALID_OR_EXPIRED_TOKEN',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Card errors
  CARD_NOT_FOUND: 'CARD_NOT_FOUND',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // Gazette errors
  ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND',

  // Recharge errors
  PACK_NOT_FOUND: 'PACK_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
