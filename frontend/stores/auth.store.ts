import { create } from 'zustand';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        set({ accessToken: token, isAuthenticated: true });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const result = await authService.login({ email, password });
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken);
    set({
      user: result.user,
      accessToken: result.accessToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
      await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
