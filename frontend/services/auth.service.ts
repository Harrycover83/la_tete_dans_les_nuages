import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post('/api/auth/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post('/api/auth/login', payload).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/api/auth/reset-password', { token, newPassword }).then((r) => r.data),
};
