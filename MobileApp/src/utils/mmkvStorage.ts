import { MMKV } from 'react-native-mmkv';
import { POI } from '../services/poiService';
import { Tour } from '../services/tourService';

// Initialize MMKV storage
const storage = new MMKV();

export interface CacheMetadata {
  timestamp: number;
  ttl_minutes: number;
  version: string;
}

/**
 * MMKV-based offline storage utility
 * Manages caching of POIs, tours, and analytics data
 * Automatically handles cache expiration and cleanup
 */
export const mmkvStorage = {
  /**
   * Save data with TTL (time to live in minutes)
   */
  async save<T>(key: string, data: T, ttl_minutes: number = 60): Promise<void> {
    try {
      const metadata: CacheMetadata = {
        timestamp: Date.now(),
        ttl_minutes,
        version: '1.0',
      };

      const cacheEntry = {
        data,
        metadata,
      };

      storage.set(key, JSON.stringify(cacheEntry));
      console.log(`[Cache] Saved key: ${key} (TTL: ${ttl_minutes}m)`);
    } catch (err) {
      console.error(`[Cache] Failed to save ${key}:`, err);
    }
  },

  /**
   * Retrieve data if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = storage.getString(key);
      if (!value) return null;

      const cacheEntry = JSON.parse(value);
      const { data, metadata } = cacheEntry;

      // Check if cache expired
      const ageMinutes = (Date.now() - metadata.timestamp) / (1000 * 60);
      if (ageMinutes > metadata.ttl_minutes) {
        console.log(`[Cache] Expired key: ${key}`);
        storage.delete(key);
        return null;
      }

      console.log(`[Cache] Hit: ${key}`);
      return data as T;
    } catch (err) {
      console.error(`[Cache] Failed to get ${key}:`, err);
      return null;
    }
  },

  /**
   * Remove specific key
   */
  async remove(key: string): Promise<void> {
    try {
      storage.delete(key);
      console.log(`[Cache] Deleted: ${key}`);
    } catch (err) {
      console.error(`[Cache] Failed to delete ${key}:`, err);
    }
  },

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      storage.clearAll();
      console.log('[Cache] Cleared all');
    } catch (err) {
      console.error('[Cache] Failed to clear:', err);
    }
  },

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<void> {
    try {
      const allKeys = storage.getAllKeys();
      let cleaned = 0;

      for (const key of allKeys) {
        const value = storage.getString(key);
        if (!value) continue;

        try {
          const cacheEntry = JSON.parse(value);
          const { metadata } = cacheEntry;
          const ageMinutes = (Date.now() - metadata.timestamp) / (1000 * 60);

          if (ageMinutes > metadata.ttl_minutes) {
            storage.delete(key);
            cleaned++;
          }
        } catch {
          // Skip invalid entries
        }
      }

      console.log(`[Cache] Cleaned ${cleaned} expired entries`);
    } catch (err) {
      console.error('[Cache] Failed to clean expired:', err);
    }
  },

  /**
   * Get cache size in bytes
   */
  async getSize(): Promise<number> {
    try {
      const allKeys = storage.getAllKeys();
      let totalSize = 0;

      for (const key of allKeys) {
        const value = storage.getString(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (err) {
      console.error('[Cache] Failed to get size:', err);
      return 0;
    }
  },

  /**
   * Cache POI data
   */
  async cachePOI(poi: POI): Promise<void> {
    await this.save(`poi_${poi.id}`, poi, 1440); // 24 hours
  },

  /**
   * Get cached POI
   */
  async getCachedPOI(id: string): Promise<POI | null> {
    return this.get<POI>(`poi_${id}`);
  },

  /**
   * Cache POI list
   */
  async cachePOIList(pois: POI[]): Promise<void> {
    await this.save('poi_list', pois, 120); // 2 hours
  },

  /**
   * Get cached POI list
   */
  async getCachedPOIList(): Promise<POI[] | null> {
    return this.get<POI[]>('poi_list');
  },

  /**
   * Cache tour data
   */
  async cacheTour(tour: Tour): Promise<void> {
    await this.save(`tour_${tour.id}`, tour, 1440); // 24 hours
  },

  /**
   * Get cached tour
   */
  async getCachedTour(id: string): Promise<Tour | null> {
    return this.get<Tour>(`tour_${id}`);
  },

  /**
   * Cache tour list
   */
  async cacheTourList(tours: Tour[]): Promise<void> {
    await this.save('tour_list', tours, 120); // 2 hours
  },

  /**
   * Get cached tour list
   */
  async getCachedTourList(): Promise<Tour[] | null> {
    return this.get<Tour[]>('tour_list');
  },
};
