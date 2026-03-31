import { api } from './api';

export const cardService = {
  getMyCard: () => api.get('/api/card/me').then((r) => r.data),
  getTransactions: (page = 1, limit = 20) =>
    api.get('/api/card/transactions', { params: { page, limit } }).then((r) => r.data),
};

export const rechargeService = {
  getPacks: () => api.get('/api/recharge/packs').then((r) => r.data),
  createPaymentIntent: (packId: string) =>
    api.post('/api/recharge/payment-intent', { packId }).then((r) => r.data),
};

export const gazetteService = {
  getArticles: (page = 1, category?: string, venueId?: string) =>
    api
      .get('/api/gazette', { params: { page, category, venueId } })
      .then((r) => r.data),
  getArticleById: (id: string) => api.get(`/api/gazette/${id}`).then((r) => r.data),
};

export const leaderboardService = {
  getLeaderboard: (gameId: string, venueId?: string, page = 1) =>
    api.get(`/api/leaderboard/${gameId}`, { params: { venueId, page } }).then((r) => r.data),
  getUserStats: (userId: string) =>
    api.get(`/api/user/${userId}/stats`).then((r) => r.data),
  recordGameSession: (gameId: string, score: number, duration: number) =>
    api.post('/api/leaderboard/game-session', { gameId, score, duration }).then((r) => r.data),
};

export const userService = {
  getMe: () => api.get('/api/user/me').then((r) => r.data),
  updateMe: (data: { firstName?: string; lastName?: string; dateOfBirth?: string }) =>
    api.patch('/api/user/me', data).then((r) => r.data),
};
