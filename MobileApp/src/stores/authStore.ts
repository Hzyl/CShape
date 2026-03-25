import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const TOKEN_STORAGE_KEY = 'admin_token';

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
  initializeAuth: () => Promise<void>; // Load token from storage on app startup
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  failedLoginAttempts: 0,
  isLocked: 0,

  // Initialize auth on app startup - load token from AsyncStorage
  initializeAuth: async () => {
    try {
      const [token, attempts, locked] = await Promise.all([
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
        AsyncStorage.getItem('login_attempts'),
        AsyncStorage.getItem('login_locked_until'),
      ]);

      set({
        token: token || null,
        isAuthenticated: !!token,
        failedLoginAttempts: parseInt(attempts || '0', 10),
        isLocked: parseInt(locked || '0', 10),
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },

  login: async (email: string, password: string) => {
    const state = get();

    // Check if account is locked
    const now = Date.now();
    if (state.isLocked > now) {
      const remainingSeconds = Math.ceil((state.isLocked - now) / 1000);
      throw new Error(`Account is locked. Please try again in ${remainingSeconds} seconds.`);
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
      await Promise.all([
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, responseData.accessToken),
        AsyncStorage.setItem('login_attempts', '0'),
        AsyncStorage.removeItem('login_locked_until'),
      ]);

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
        await AsyncStorage.setItem('login_attempts', attempts.toString());

        if (attempts >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
          await AsyncStorage.setItem('login_locked_until', lockUntil.toString());
          set({ isLocked: lockUntil, failedLoginAttempts: attempts });
        }

        set({ failedLoginAttempts: attempts });
      }

      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      failedLoginAttempts: 0,
      isLocked: 0,
    });
  },

  setUser: (user: any) => {
    set({ user });
  },

  checkTokenValidity: () => {
    const token = get().token;
    return !!token;
  },
}));
