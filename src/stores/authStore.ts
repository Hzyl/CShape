import { create } from 'zustand';
import axios from 'axios';

export interface AuthState {
  user: { email: string; role: string } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  failedLoginAttempts: number;
  isLocked: number; // timestamp when locked, 0 if not locked
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
  checkTokenValidity: () => boolean;
}

const TOKEN_STORAGE_KEY = 'admin_token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem(TOKEN_STORAGE_KEY),
  failedLoginAttempts: parseInt(localStorage.getItem('login_attempts') || '0'),
  isLocked: parseInt(localStorage.getItem('login_locked_until') || '0'),

  login: async (email: string, password: string) => {
    const state = get();

    // Check if account is locked
    const now = Date.now();
    if (state.isLocked > now) {
      throw new Error(`Account is locked. Please try again in ${Math.ceil((state.isLocked - now) / 1000)} seconds.`);
    }

    set({ isLoading: true });
    try {
      // Call real C# backend API
      const response = await axios.post(`${API_URL}/admin/auth/login`, {
        email,
        password,
      });

      const { data: responseData } = response.data;
      if (!responseData?.accessToken) {
        throw new Error('Invalid login response');
      }

      // Success - reset attempts
      localStorage.setItem('login_attempts', '0');
      localStorage.removeItem('login_locked_until');

      localStorage.setItem(TOKEN_STORAGE_KEY, responseData.accessToken);
      set({
        token: responseData.accessToken,
        user: { email: responseData.email, role: responseData.role },
        isAuthenticated: true,
        failedLoginAttempts: 0,
        isLocked: 0,
      });
    } catch (error: any) {
      // Handle failed login attempts (frontend tracking for UX feedback)
      if (error.response?.status === 401) {
        const attempts = state.failedLoginAttempts + 1;
        localStorage.setItem('login_attempts', attempts.toString());

        if (attempts >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
          localStorage.setItem('login_locked_until', lockUntil.toString());
          set({ isLocked: lockUntil, failedLoginAttempts: attempts });
        }

        set({ failedLoginAttempts: attempts });
        throw error;
      }

      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user: any) => {
    set({ user });
  },

  checkTokenValidity: () => {
    const token = get().token;
    return !!token;
  },
}));
