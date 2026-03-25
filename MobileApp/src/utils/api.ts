import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - load from environment or use localhost default
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Create Axios instance with JWT interceptor for mobile app
 * Automatically adds Authorization header to requests
 * Handles 401 responses by clearing auth state
 */
let axiosInstance: AxiosInstance | null = null;

export const createAxiosInstance = async () => {
  const token = await AsyncStorage.getItem('admin_token');

  axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Response interceptor: handle 401 (unauthorized)
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // If 401 (unauthorized), clear auth state and redirect to login
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('admin_token');
        await AsyncStorage.removeItem('login_attempts');
        await AsyncStorage.removeItem('login_locked_until');

        // Notify app to redirect to login (handled in app root component)
        // Emit event or return special error
        throw new Error('UNAUTHORIZED');
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

/**
 * Get existing axios instance (or create if doesn't exist)
 */
export const getAxiosInstance = async (): Promise<AxiosInstance> => {
  if (!axiosInstance) {
    return createAxiosInstance();
  }
  return axiosInstance;
};

/**
 * Helper: Make GET request
 */
export const apiGet = async (url: string, config?: any) => {
  const instance = await getAxiosInstance();
  return instance.get(url, config);
};

/**
 * Helper: Make POST request
 */
export const apiPost = async (url: string, data?: any, config?: any) => {
  const instance = await getAxiosInstance();
  return instance.post(url, data, config);
};

/**
 * Helper: Make PUT request
 */
export const apiPut = async (url: string, data?: any, config?: any) => {
  const instance = await getAxiosInstance();
  return instance.put(url, data, config);
};

/**
 * Helper: Make DELETE request
 */
export const apiDelete = async (url: string, config?: any) => {
  const instance = await getAxiosInstance();
  return instance.delete(url, config);
};

export { API_URL };
