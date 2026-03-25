import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook to access authentication state and methods
 * Simplifies component integration with Zustand store
 *
 * Usage:
 *   const { user, token, isLoading, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    failedLoginAttempts,
    isLocked,
    login,
    logout,
    setUser,
    checkTokenValidity,
  } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    failedLoginAttempts,
    isLocked,
    login,
    logout,
    setUser,
    checkTokenValidity,
  };
};
