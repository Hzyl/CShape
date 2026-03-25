import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../stores/locationStore';

const LOCATION_THROTTLE_INTERVAL = 5000; // Update location every 5 seconds

/**
 * Custom hook for GPS location tracking
 * - Requests location permissions on first use
 * - Monitors user position with throttling
 * - Updates location store
 *
 * Usage:
 *   const { latitude, longitude, hasPermission, error } = useLocation();
 */
export const useLocation = () => {
  const {
    latitude,
    longitude,
    accuracy,
    hasLocationPermission,
    isTrackingLocation,
    locationError,
    setLocation,
    setHasLocationPermission,
    setIsTrackingLocation,
    setLocationError,
  } = useLocationStore();

  // Initialize location tracking on mount
  useEffect(() => {
    let unsubscribe: any = null;

    const initializeLocation = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          setHasLocationPermission(true);

          // Start watching position with throttling
          unsubscribe = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: LOCATION_THROTTLE_INTERVAL,
              distanceInterval: 5, // meters - update if moved 5+ meters
            },
            (location) => {
              const { latitude: lat, longitude: lng, accuracy: acc } = location.coords;
              setLocation(lat, lng, acc || 0);
              setIsTrackingLocation(true);
            }
          );
        } else {
          setHasLocationPermission(false);
          setLocationError('Location permission denied');
        }
      } catch (error: any) {
        console.error('Error initializing location:', error);
        setLocationError(error.message || 'Failed to initialize location');
      }
    };

    initializeLocation();

    // Cleanup: stop watching when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    hasLocationPermission,
    isTrackingLocation,
    locationError,
  };
};
