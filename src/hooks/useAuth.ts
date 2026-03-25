import { useAuthStore } from '@/stores/authStore';

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
    checkTokenValidity,
  } = useAuthStore();

  const getLockTimeRemaining = () => {
    const now = Date.now();
    if (isLocked > now) {
      return Math.ceil((isLocked - now) / 1000);
    }
    return 0;
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    failedLoginAttempts,
    isLocked,
    lockTimeRemaining: getLockTimeRemaining(),
    login,
    logout,
    checkTokenValidity,
  };
};
