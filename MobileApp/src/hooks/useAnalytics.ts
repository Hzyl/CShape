import { useEffect } from 'react';
import { AppState, Network } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAnalyticsStore, AnalyticsEvent } from '../stores/analyticsStore';

/**
 * Custom hook for analytics tracking and offline management
 * - Tracks user events (POI views, audio plays, tours, QR scans)
 * - Monitors network status and syncs offline events when online
 * - Automatically flushes queued events
 */
export const useAnalytics = () => {
  const { trackEvent, flushEvents, setOnlineStatus, getSummary, eventQueue } = useAnalyticsStore();

  const handleAppStateChange = (state: string) => {
    if (state === 'background') {
      // Flush events before app goes to background
      flushEvents();
    }
  };

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable === true;
      setOnlineStatus(isOnline);

      if (isOnline) {
        console.log('[Analytics] Back online, syncing events...');
        flushEvents();
      }
    });

    return unsubscribe;
  }, [flushEvents, setOnlineStatus]);

  // Sync events periodically (every 30 seconds) and on app background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Periodic sync
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        flushEvents();
      }
    }, 30000); // 30 seconds

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [eventQueue, flushEvents]);

  /**
   * Track POI view event
   */
  const trackPOIView = async (poiId: string, latitude?: number, longitude?: number) => {
    await trackEvent({
      event_type: 'poi_view',
      poi_id: poiId,
      latitude,
      longitude,
    });
  };

  /**
   * Track audio play event
   */
  const trackAudioPlay = async (
    poiId: string,
    language: 'vi' | 'en' | 'jp',
    durationSeconds: number
  ) => {
    await trackEvent({
      event_type: 'audio_play',
      poi_id: poiId,
      language,
      duration_seconds: durationSeconds,
    });
  };

  /**
   * Track tour start event
   */
  const trackTourStart = async (tourId: string) => {
    await trackEvent({
      event_type: 'tour_start',
      tour_id: tourId,
    });
  };

  /**
   * Track tour completion event
   */
  const trackTourComplete = async (tourId: string, durationSeconds: number) => {
    await trackEvent({
      event_type: 'tour_complete',
      tour_id: tourId,
      duration_seconds: durationSeconds,
    });
  };

  /**
   * Track QR code scan event
   */
  const trackQRScan = async (poiId: string) => {
    await trackEvent({
      event_type: 'qr_scan',
      poi_id: poiId,
    });
  };

  /**
   * Track geofence entry event
   */
  const trackGeofenceEntry = async (poiId: string, latitude: number, longitude: number) => {
    await trackEvent({
      event_type: 'geofence_enter',
      poi_id: poiId,
      latitude,
      longitude,
    });
  };

  return {
    trackPOIView,
    trackAudioPlay,
    trackTourStart,
    trackTourComplete,
    trackQRScan,
    trackGeofenceEntry,
    getSummary,
    flushEvents,
    eventQueue,
  };
};
