import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('adminToken'));

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (data.user.role !== 'ADMIN') throw new Error('NOT_ADMIN');
    localStorage.setItem('adminToken', data.accessToken);
    localStorage.setItem('adminRefreshToken', data.refreshToken);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    setIsAuthenticated(false);
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
