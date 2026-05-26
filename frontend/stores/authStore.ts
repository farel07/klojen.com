// stores/authStore.ts
import { create } from 'zustand';
import { Role } from '@/app/types';

interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),

  setAccessToken: (token) => set({ accessToken: token }),

  logout: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}));

// Helper untuk diakses di luar komponen (misal: axios interceptor)
export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);
export const logoutStore = () => useAuthStore.getState().logout();
