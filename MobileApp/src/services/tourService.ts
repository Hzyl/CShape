import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export interface TourStop {
  poi_id: string;
  order: number;
  name?: string;
  description?: string;
}

export interface Tour {
  id?: string;
  name: string;
  description: string;
  descriptionVi?: string;
  descriptionEn?: string;
  thumbnail?: string;
  image_url?: string;
  duration_minutes?: number;
  difficulty?: 'easy' | 'moderate' | 'hard';
  stops: TourStop[];
  poi_count?: number;
  views?: number;
  rating?: number;
  featured?: boolean;
  category?: string;
}

/**
 * Tour Service - API integration for tour operations
 * Handles: list tours, get tour details, start tour, track playback
 */
export const tourService = {
  /**
   * Get all available tours with pagination
   */
  async getAllTours(page: number = 1, limit: number = 20, category?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) params.append('category', category);

    return apiGet(`/tour/load-all?${params.toString()}`) as Promise<{
      data: Tour[];
      total: number;
      page: number;
    }>;
  },

  /**
   * Get featured/trending tours (home screen)
   */
  async getFeaturedTours() {
    return apiGet('/tour/featured') as Promise<{ data: Tour[] }>;
  },

  /**
   * Get tour by ID with full details including all stops
   */
  async getTourById(id: string) {
    return apiGet(`/tour/${id}`) as Promise<{ data: Tour }>;
  },

  /**
   * Search tours by name or description
   */
  async searchTours(query: string, limit: number = 20) {
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString(),
    });
    return apiGet(`/tour/search?${params.toString()}`) as Promise<{
      data: Tour[];
    }>;
  },

  /**
   * Get tours by category
   */
  async getToursByCategory(category: string, page: number = 1, limit: number = 20) {
    return apiGet(
      `/tour/category/${category}?page=${page}&limit=${limit}`
    ) as Promise<{ data: Tour[]; total: number }>;
  },

  /**
   * Track tour play start event
   */
  async startTourPlayback(tourId: string) {
    return apiPost('/tour/playback/start', {
      tour_id: tourId,
      started_at: new Date().toISOString(),
    }) as Promise<{ data: { session_id: string } }>;
  },

  /**
   * Track POI played within a tour
   */
  async trackPOIInTour(sessionId: string, poiId: string, durationSeconds: number) {
    return apiPost('/tour/playback/track', {
      session_id: sessionId,
      poi_id: poiId,
      duration_seconds: durationSeconds,
      played_at: new Date().toISOString(),
    }) as Promise<{ success: boolean }>;
  },

  /**
   * End tour playback session
   */
  async endTourPlayback(sessionId: string, totalDurationSeconds: number) {
    return apiPost('/tour/playback/end', {
      session_id: sessionId,
      total_duration_seconds: totalDurationSeconds,
      ended_at: new Date().toISOString(),
    }) as Promise<{ success: boolean }>;
  },

  /**
   * Get tour recommendations based on user location
   */
  async getRecommendedTours(latitude: number, longitude: number) {
    return apiGet(
      `/tour/nearby?latitude=${latitude}&longitude=${longitude}`
    ) as Promise<{ data: Tour[] }>;
  },

  // Admin operations (for future use)
  async createTour(tour: Tour) {
    return apiPost('/tour', tour) as Promise<{ data: Tour }>;
  },

  async updateTour(id: string, tour: Partial<Tour>) {
    return apiPut(`/tour/${id}`, tour) as Promise<{ data: Tour }>;
  },

  async deleteTour(id: string) {
    return apiDelete(`/tour/${id}`) as Promise<{ success: boolean }>;
  },
};
