import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

/**
 * POI API Response types
 */
export interface POI {
  id?: string;
  name: string;
  type: string;
  category?: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  priority: number;
  descriptionVi: string;
  descriptionEn?: string;
  descriptionJp?: string;
  imageUrls?: string[];
  audioStatus?: 'pending' | 'processing' | 'completed';
  audioUrl?: string;
  qrCodeHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface POIResponse {
  data: POI[];
  total: number;
  page: number;
  limit: number;
}

export interface NearbyPOIResponse {
  data: POI[];
}

/**
 * POI Service - Handles all POI-related API calls
 * Integrates with C# backend at /api/v1/poi
 */
export const poiService = {
  /**
   * Get all POIs with pagination and filtering
   * GET /api/v1/poi/load-all?page=1&limit=20&search=&type=
   */
  async getAllPOIs(
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: string
  ): Promise<POIResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(type && { type }),
      });

      const response = await apiGet(`/poi/load-all?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching POIs:', error);
      throw error;
    }
  },

  /**
   * Get single POI by ID
   * GET /api/v1/poi/{id}
   */
  async getPOIById(id: string): Promise<POI> {
    try {
      const response = await apiGet(`/poi/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error fetching POI ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get POI by QR code hash
   * GET /api/v1/poi/qr/{hash}
   */
  async getPOIByQRHash(hash: string): Promise<POI> {
    try {
      const response = await apiGet(`/poi/qr/${hash}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error fetching POI by QR hash ${hash}:`, error);
      throw error;
    }
  },

  /**
   * Get nearby POIs based on user location
   * GET /api/v1/poi/nearby?latitude=&longitude=&radiusMeters=1000
   */
  async getNearbyPOIs(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<POI[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radiusMeters: radiusMeters.toString(),
      });

      const response = await apiGet(`/poi/nearby?${params}`);
      return response.data?.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching nearby POIs:', error);
      throw error;
    }
  },

  /**
   * Create new POI (admin only)
   * POST /api/v1/poi
   */
  async createPOI(poi: Partial<POI>): Promise<POI> {
    try {
      const response = await apiPost('/poi', poi);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error creating POI:', error);
      throw error;
    }
  },

  /**
   * Update existing POI (admin only)
   * PUT /api/v1/poi/{id}
   */
  async updatePOI(id: string, poi: Partial<POI>): Promise<POI> {
    try {
      const response = await apiPut(`/poi/${id}`, poi);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error updating POI ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete POI (admin only)
   * DELETE /api/v1/poi/{id}
   */
  async deletePOI(id: string): Promise<void> {
    try {
      await apiDelete(`/poi/${id}`);
    } catch (error: any) {
      console.error(`Error deleting POI ${id}:`, error);
      throw error;
    }
  },
};
