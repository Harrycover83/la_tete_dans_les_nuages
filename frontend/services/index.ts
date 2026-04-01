import { api } from './api';

export const cardService = {
  getMyCard: () => api.get('/api/card/me').then((r) => r.data),
  getTransactions: (page = 1, limit = 20) =>
    api.get('/api/card/transactions', { params: { page, limit } }).then((r) => r.data),
  getWalletPassUrl: () =>
    `${api.defaults.baseURL}/api/card/wallet-pass`,
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

export const venueService = {
  getVenues: () => api.get('/api/venues').then((r) => r.data),
  getVenueById: (id: string) => api.get(`/api/venues/${id}`).then((r) => r.data),
};

export const sessionBookingService = {
  create: (data: {
    venueId: string;
    eventTypeId: string;
    participants: number;
    bookingDate: string;
    timeSlot: string;
    formulaId?: string;
    cakeId?: string;
    totalPrice: number;
    notes?: string;
  }) => api.post('/api/session-bookings', data).then((r) => r.data),
  getMy: () => api.get('/api/session-bookings/my').then((r) => r.data),
  cancel: (id: string) => api.patch(`/api/session-bookings/${id}/cancel`).then((r) => r.data),
};
  getUpcomingEvents: (venueId?: string) =>
    api.get('/api/events', { params: venueId ? { venueId } : {} }).then((r) => r.data),
  getEventById: (id: string) => api.get(`/api/events/${id}`).then((r) => r.data),
  bookEvent: (eventId: string) => api.post('/api/events/book', { eventId }).then((r) => r.data),
  getMyBookings: () => api.get('/api/events/my/bookings').then((r) => r.data),
  cancelBooking: (bookingId: string) =>
    api.patch(`/api/events/my/bookings/${bookingId}/cancel`).then((r) => r.data),
};
