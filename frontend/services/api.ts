import axios from 'axios';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage-keys';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh access token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
    return Promise.reject(error);
  }
);
