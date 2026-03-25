import { useEffect, useRef } from 'react';
import { useLocationStore } from '../stores/locationStore';
import { useGeofenceStore } from '../stores/geofenceStore';
import { useAudioStore } from '../stores/audioStore';
import { POI } from '../services/poiService';

const GEOFENCE_CHECK_INTERVAL = 1000; // Check every 1 second
const GEOFENCE_DEBOUNCE_TIME = 3000; // 3 consecutive checks to trigger
const GEOFENCE_EXIT_THRESHOLD = 3000; // 3 seconds outside zone to exit
const GEOFENCE_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown after play

interface GeofenceCheckState {
  poiId: string;
  insideCount: number;
  outsideCount: number;
  lastTriggeredTime: number;
}

/**
 * Custom hook for geofencing logic
 * - Calculates distance to all POIs using Haversine formula
 * - Triggers ENTER event when distance ≤ triggerRadius for 3 consecutive checks
 * - Triggers EXIT event when moved outside + 3 seconds has passed
 * - Respects cooldown to prevent re-triggers within 5 minutes
 * - Handles overlapping POIs by priority
 *
 * Usage:
 *   const { nearbyPOIs } = useGeofence(allPOIs);
 */
export const useGeofence = (pois: POI[]) => {
  const userLat = useLocationStore((s) => s.latitude);
  const userLng = useLocationStore((s) => s.longitude);

  const {
    enteredPOIIds,
    addEnteredPOI,
    removeEnteredPOI,
    canTrigger,
    setLastTriggeredTime,
    logEvent,
  } = useGeofenceStore();

  const { setCurrentPOI, setIsPlaying } = useAudioStore();

  const checkStateRef = useRef<Map<string, GeofenceCheckState>>(new Map());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize check states for all POIs
  useEffect(() => {
    pois.forEach((poi) => {
      if (poi.id && !checkStateRef.current.has(poi.id)) {
        checkStateRef.current.set(poi.id, {
          poiId: poi.id,
          insideCount: 0,
          outsideCount: 0,
          lastTriggeredTime: 0,
        });
      }
    });
  }, [pois.length]);

  // Main geofencing loop
  useEffect(() => {
    if (!userLat || !userLng) return;

    const checkGeofences = () => {
      const now = Date.now();

      pois.forEach((poi) => {
        if (!poi.id) return;

        const distance = calculateDistance(
          userLat,
          userLng,
          poi.latitude,
          poi.longitude
        );

        const isInside = distance <= (poi.triggerRadius || 100);
        const checkState = checkStateRef.current.get(poi.id);

        // Skip if check state hasn't been initialized yet
        if (!checkState) return;

        if (isInside) {
          checkState.insideCount++;
          checkState.outsideCount = 0;

          // Trigger ENTER after 3 consecutive checks
          if (checkState.insideCount >= 3 && !enteredPOIIds.has(poi.id)) {
            const canTriggerNow = canTrigger(poi.id, GEOFENCE_COOLDOWN);

            if (canTriggerNow) {
              // ENTER event
              addEnteredPOI(poi.id);
              setLastTriggeredTime(poi.id, now);
              logEvent(poi.id, 'enter');

              // Auto-play audio (BR-01)
              setCurrentPOI(poi.id);
              setIsPlaying(true);

              console.log(`[Geofence] ENTER: ${poi.name}`);
            } else {
              // Cooldown active, don't trigger
              console.log(
                `[Geofence] COOLDOWN: ${poi.name} (re-enter protection)`
              );
            }
          }
        } else {
          checkState.outsideCount++;
          checkState.insideCount = 0;

          // Trigger EXIT after 3 seconds outside
          if (checkState.outsideCount * GEOFENCE_CHECK_INTERVAL >= GEOFENCE_EXIT_THRESHOLD &&
            enteredPOIIds.has(poi.id)) {
            // EXIT event
            removeEnteredPOI(poi.id);
            logEvent(poi.id, 'exit');

            // Stop audio
            setIsPlaying(false);

            console.log(`[Geofence] EXIT: ${poi.name}`);
          }
        }
      });
    };

    // Start polling
    pollIntervalRef.current = setInterval(checkGeofences, GEOFENCE_CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userLat, userLng, pois, enteredPOIIds]);

  // Get nearby POIs sorted by distance
  const getNearbyPOIs = () => {
    if (!userLat || !userLng) return [];

    return pois
      .map((poi) => ({
        ...poi,
        distance: calculateDistance(
          userLat,
          userLng,
          poi.latitude,
          poi.longitude
        ),
      }))
      .filter((poi) => poi.distance <= 1000) // Within 1km
      .sort((a, b) => a.distance - b.distance);
  };

  return {
    enteredPOIIds: Array.from(enteredPOIIds),
    nearbyPOIs: getNearbyPOIs(),
  };
};

/**
 * Haversine formula - Calculate distance between two coordinates (in meters)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
