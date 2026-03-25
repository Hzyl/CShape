import { create } from 'zustand';

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
      // MOCK API - Replace with real endpoint when backend is ready
      // POST /api/v1/admin/auth/login
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Simple validation for mock
      if (email !== 'admin@vinh-khanh.local' || password !== 'password') {
        const attempts = state.failedLoginAttempts + 1;
        localStorage.setItem('login_attempts', attempts.toString());

        if (attempts >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
          localStorage.setItem('login_locked_until', lockUntil.toString());
          set({ isLocked: lockUntil, failedLoginAttempts: attempts });
          throw new Error('Too many failed login attempts. Account locked for 5 minutes.');
        }

        set({ failedLoginAttempts: attempts });
        throw new Error('Email hoặc mật khẩu không đúng.');
      }

      // Success - reset attempts
      localStorage.setItem('login_attempts', '0');
      localStorage.removeItem('login_locked_until');

      const response = {
        access_token: 'mock-jwt-token-' + Date.now(),
        email: email,
      };

      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      set({
        token: response.access_token,
        user: { email: email, role: 'admin' },
        isAuthenticated: true,
        failedLoginAttempts: 0,
        isLocked: 0,
      });
    } catch (error) {
      set({ isLoading: false });
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
    return !!token && token.startsWith('mock-jwt-token');
  },
}));
