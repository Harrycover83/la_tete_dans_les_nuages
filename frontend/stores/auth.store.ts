import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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
      const token = await SecureStore.getItemAsync('accessToken');
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
    await SecureStore.setItemAsync('accessToken', result.accessToken);
    await SecureStore.setItemAsync('refreshToken', result.refreshToken);
    set({
      user: result.user,
      accessToken: result.accessToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
