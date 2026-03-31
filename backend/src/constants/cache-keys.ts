/**
 * Clés Redis utilisées pour le cache
 * Zéro magic string : toutes les clés sont des fonctions typées
 */
export const CACHE_KEYS = {
  /**
   * Clé pour le cache de la carte d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Clé Redis formatée
   */
  CARD: (userId: string) => `card:${userId}`,

  /**
   * Clé pour le solde de la carte d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Clé Redis formatée
   */
  CARD_BALANCE: (userId: string) => `card:balance:${userId}`,

  /**
   * Clé pour le cache du profil complet d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Clé Redis formatée
   */
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,

  /**
   * Clé pour la liste des articles gazette
   */
  GAZETTE_ARTICLES: 'gazette:articles:all',

  /**
   * Clé pour le leaderboard d'un jeu
   * @param gameId - ID du jeu
   * @returns Clé Redis formatée
   */
  LEADERBOARD: (gameId: string) => `leaderboard:game:${gameId}`,

  /**
   * Clé pour la liste des packs de recharge
   */
  RECHARGE_PACKS: 'recharge:packs:all',
} as const;
