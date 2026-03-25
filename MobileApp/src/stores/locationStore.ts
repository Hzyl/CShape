import { create } from 'zustand';

export interface LocationState {
  // Current user location
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;

  // Permission & loading state
  hasLocationPermission: boolean;
  isTrackingLocation: boolean;
  locationError: string | null;

  // Actions
  setLocation: (lat: number, lng: number, accuracy: number) => void;
  setHasLocationPermission: (hasPermission: boolean) => void;
  setIsTrackingLocation: (isTracking: boolean) => void;
  setLocationError: (error: string | null) => void;
  resetLocation: () => void;
}

/**
 * Location Store - Manages GPS tracking state
 * Stores user's current lat/lng, permissions, and tracking status
 */
export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,

  hasLocationPermission: false,
  isTrackingLocation: false,
  locationError: null,

  setLocation: (lat: number, lng: number, accuracy: number) => {
    set({
      latitude: lat,
      longitude: lng,
      accuracy,
      locationError: null,
    });
  },

  setHasLocationPermission: (hasPermission: boolean) => {
    set({ hasLocationPermission: hasPermission });
  },

  setIsTrackingLocation: (isTracking: boolean) => {
    set({ isTrackingLocation: isTracking });
  },

  setLocationError: (error: string | null) => {
    set({ locationError: error });
  },

  resetLocation: () => {
    set({
      latitude: null,
      longitude: null,
      accuracy: null,
      isTrackingLocation: false,
      locationError: null,
    });
  },
}));
