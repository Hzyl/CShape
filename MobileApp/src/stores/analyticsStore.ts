import { create } from 'zustand';
import { mmkvStorage } from '../utils/mmkvStorage';

export interface AnalyticsEvent {
  event_type: 'poi_view' | 'audio_play' | 'tour_start' | 'tour_complete' | 'qr_scan' | 'geofence_enter';
  poi_id?: string;
  tour_id?: string;
  duration_seconds?: number;
  language?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export interface AnalyticsSummary {
  total_pois_viewed: number;
  total_audio_played: number;
  total_audio_duration: number;
  total_tours_started: number;
  total_tours_completed: number;
  total_qr_scans: number;
  total_geofence_triggers: number;
  favorite_pois: Map<string, number>;
  favorite_language: string;
  last_updated: string;
}

interface AnalyticsState {
  // Event queue for offline mode
  eventQueue: AnalyticsEvent[];
  isOnline: boolean;
  summary: AnalyticsSummary | null;

  // Actions
  trackEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => Promise<void>;
  flushEvents: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
  getSummary: () => AnalyticsSummary;
  reset: () => void;
}

/**
 * Analytics Store - Manages event tracking and offline queuing
 * - Tracks user interactions (POI views, audio plays, tours, QR scans, geofencing)
 * - Queues events when offline and syncs when online
 * - Maintains local summary statistics
 * - Persists to local storage via MMKV
 */
export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  eventQueue: [],
  isOnline: true,
  summary: null,

  /**
   * Track a user event (POI view, audio play, etc.)
   * Automatically queues offline and syncs when online
   */
  trackEvent: async (event: Omit<AnalyticsEvent, 'timestamp'>) => {
    const eventWithTimestamp: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Always save to local queue
    const state = get();
    const updatedQueue = [...state.eventQueue, eventWithTimestamp];
    set({ eventQueue: updatedQueue });

    // Save to persistent storage
    await mmkvStorage.save('analytics_queue', updatedQueue);

    // Update local summary
    const summary = get().getSummary();

    // If online, try to sync immediately
    if (state.isOnline) {
      await get().flushEvents();
    }
  },

  /**
   * Flush all queued events to backend
   */
  flushEvents: async () => {
    const state = get();
    if (state.eventQueue.length === 0) return;

    try {
      // POST /api/v1/analytics/events with batch
      const response = await fetch('http://localhost:5000/api/v1/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          events: state.eventQueue,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Clear queue after successful sync
        set({ eventQueue: [] });
        await mmkvStorage.save('analytics_queue', []);
        console.log(`[Analytics] Synced ${state.eventQueue.length} events`);
      }
    } catch (err) {
      console.error('[Analytics] Failed to flush events:', err);
      // Keep queue in storage for retry later
    }
  },

  /**
   * Update online status and sync if transitioning from offline to online
   */
  setOnlineStatus: async (online: boolean) => {
    set({ isOnline: online });

    if (online && get().eventQueue.length > 0) {
      // Try to sync when coming back online
      await get().flushEvents();
    }
  },

  /**
   * Get current analytics summary
   */
  getSummary: (): AnalyticsSummary => {
    const state = get();
    const events = state.eventQueue;

    const summary: AnalyticsSummary = {
      total_pois_viewed: events.filter((e) => e.event_type === 'poi_view').length,
      total_audio_played: events.filter((e) => e.event_type === 'audio_play').length,
      total_audio_duration: events
        .filter((e) => e.event_type === 'audio_play')
        .reduce((sum, e) => sum + (e.duration_seconds || 0), 0),
      total_tours_started: events.filter((e) => e.event_type === 'tour_start').length,
      total_tours_completed: events.filter((e) => e.event_type === 'tour_complete').length,
      total_qr_scans: events.filter((e) => e.event_type === 'qr_scan').length,
      total_geofence_triggers: events.filter((e) => e.event_type === 'geofence_enter').length,
      favorite_pois: new Map(),
      favorite_language: 'vi',
      last_updated: new Date().toISOString(),
    };

    // Calculate favorite POIs
    const poiCounts = new Map<string, number>();
    events
      .filter((e) => e.poi_id)
      .forEach((e) => {
        const count = poiCounts.get(e.poi_id!) || 0;
        poiCounts.set(e.poi_id!, count + 1);
      });

    summary.favorite_pois = poiCounts;

    // Determine favorite language from audio_play events
    const langCounts = new Map<string, number>();
    events
      .filter((e) => e.event_type === 'audio_play' && e.language)
      .forEach((e) => {
        const lang = e.language!;
        const count = langCounts.get(lang) || 0;
        langCounts.set(lang, count + 1);
      });

    if (langCounts.size > 0) {
      summary.favorite_language = Array.from(langCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }

    return summary;
  },

  /**
   * Reset analytics data
   */
  reset: async () => {
    set({ eventQueue: [], summary: null });
    await mmkvStorage.remove('analytics_queue');
  },
}));
