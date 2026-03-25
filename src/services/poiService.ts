import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore';

export interface POI {
  id: string;
  name: string;
  type: 'major' | 'minor';
  category?: string;
  latitude: number;
  longitude: number;
  trigger_radius: number;
  priority: number;
  description_vi: string;
  description_en?: string;
  description_jp?: string;
  image_urls?: string[];
  audio_status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  qr_code_hash: string;
  created_at?: string;
  updated_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with JWT interceptor
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  // Add JWT token to all requests
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle responses
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

export const poiService = {
  async getPOIs(page = 1, limit = 20, filters?: any) {
    try {
      const response = await apiClient.get('/poi/load-all', {
        params: {
          page,
          limit,
          search: filters?.search,
          type: filters?.type && filters.type !== 'all' ? filters.type : undefined,
        },
      });

      const { data } = response.data;
      return {
        data: (data?.data || []).map((poi: any) => ({
          poi_id: poi.id,
          ...poi,
        })),
        total: data?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching POIs:', error);
      throw error;
    }
  },

  async getPOIById(id: string) {
    try {
      const response = await apiClient.get(`/poi/${id}`);
      const poi = response.data.data;
      return { data: { poi_id: poi.id, ...poi } };
    } catch (error) {
      console.error('Error fetching POI:', error);
      throw error;
    }
  },

  async createPOI(poi: Omit<POI, 'id' | 'qr_code_hash' | 'audio_status'>) {
    try {
      const response = await apiClient.post('/poi', {
        name: poi.name,
        type: poi.type,
        category: poi.category,
        latitude: poi.latitude,
        longitude: poi.longitude,
        triggerRadius: poi.trigger_radius,
        priority: poi.priority,
        descriptionVi: poi.description_vi,
        descriptionEn: poi.description_en,
        descriptionJp: poi.description_jp,
        imageUrls: poi.image_urls,
      });

      const newPoi = response.data.data;
      return { data: { poi_id: newPoi.id, ...newPoi } };
    } catch (error) {
      console.error('Error creating POI:', error);
      throw error;
    }
  },

  async updatePOI(id: string, poi: Partial<POI>) {
    try {
      const response = await apiClient.put(`/poi/${id}`, {
        name: poi.name,
        type: poi.type,
        category: poi.category,
        latitude: poi.latitude,
        longitude: poi.longitude,
        triggerRadius: poi.trigger_radius,
        priority: poi.priority,
        descriptionVi: poi.description_vi,
        descriptionEn: poi.description_en,
        descriptionJp: poi.description_jp,
        imageUrls: poi.image_urls,
      });

      const updated = response.data.data;
      return { data: { poi_id: updated.id, ...updated } };
    } catch (error) {
      console.error('Error updating POI:', error);
      throw error;
    }
  },

  async deletePOI(id: string) {
    try {
      const response = await apiClient.delete(`/poi/${id}`);
      return { data: { success: response.data.success } };
    } catch (error) {
      console.error('Error deleting POI:', error);
      throw error;
    }
  },

  async getNearby(lat: number, lng: number, radius: number = 1000) {
    try {
      const response = await apiClient.get('/poi/nearby', {
        params: { latitude: lat, longitude: lng, radius },
      });

      const pois = response.data.data || [];
      return {
        data: pois.map((poi: any) => ({
          poi_id: poi.id,
          ...poi,
        })),
      };
    } catch (error) {
      console.error('Error fetching nearby POIs:', error);
      throw error;
    }
  },

  async getByQR(hash: string) {
    try {
      // Note: Backend doesn't have this endpoint yet, implement if needed
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error fetching POI by QR:', error);
      throw error;
    }
  },
};
