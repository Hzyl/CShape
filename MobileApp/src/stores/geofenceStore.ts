import { create } from 'zustand';

export interface GeofenceEvent {
  poiId: string;
  eventType: 'enter' | 'exit';
  timestamp: number;
}

export interface GeofenceState {
  // Entered zones
  enteredPOIIds: Set<string>;

  // Cooldown tracking (POI ID -> last triggered time)
  lastTriggeredTimes: Map<string, number>;

  // Event history
  eventHistory: GeofenceEvent[];

  // Status
  isGeofencingActive: boolean;

  // Actions
  addEnteredPOI: (poiId: string) => void;
  removeEnteredPOI: (poiId: string) => void;
  isEnteredPOI: (poiId: string) => boolean;
  setLastTriggeredTime: (poiId: string, time: number) => void;
  getLastTriggeredTime: (poiId: string) => number | undefined;
  canTrigger: (poiId: string, cooldownMs: number) => boolean;
  logEvent: (poiId: string, eventType: 'enter' | 'exit') => void;
  setGeofencingActive: (active: boolean) => void;
  reset: () => void;
}

/**
 * Geofence Store - Manages geofencing state
 * Tracks entered zones, cooldowns, and event history
 *
 * Business Rules:
 * - BR-01: Enter zone → queue audio
 * - BR-02: Already playing POI_A, enter POI_B → B added to queue
 * - BR-03: Exit + re-enter within 5 min → don't replay (cooldown)
 * - BR-04: 2 POIs overlap → play higher priority (smaller number)
 * - BR-05: Phone call arrives → auto-pause
 */
export const useGeofenceStore = create<GeofenceState>((set, get) => ({
  enteredPOIIds: new Set(),
  lastTriggeredTimes: new Map(),
  eventHistory: [],
  isGeofencingActive: true,

  addEnteredPOI: (poiId: string) => {
    const state = get();
    if (!state.enteredPOIIds.has(poiId)) {
      state.enteredPOIIds.add(poiId);
      // Trigger re-render by creating new Set
      set({ enteredPOIIds: new Set(state.enteredPOIIds) });
    }
  },

  removeEnteredPOI: (poiId: string) => {
    const state = get();
    if (state.enteredPOIIds.has(poiId)) {
      state.enteredPOIIds.delete(poiId);
      // Trigger re-render by creating new Set
      set({ enteredPOIIds: new Set(state.enteredPOIIds) });
    }
  },

  isEnteredPOI: (poiId: string) => {
    return get().enteredPOIIds.has(poiId);
  },

  setLastTriggeredTime: (poiId: string, time: number) => {
    const state = get();
    state.lastTriggeredTimes.set(poiId, time);
    // Trigger re-render by creating new Map
    set({ lastTriggeredTimes: new Map(state.lastTriggeredTimes) });
  },

  getLastTriggeredTime: (poiId: string) => {
    return get().lastTriggeredTimes.get(poiId);
  },

  canTrigger: (poiId: string, cooldownMs: number): boolean => {
    const state = get();
    const lastTriggered = state.lastTriggeredTimes.get(poiId);

    if (!lastTriggered) {
      return true; // Never triggered before
    }

    const now = Date.now();
    return now - lastTriggered >= cooldownMs;
  },

  logEvent: (poiId: string, eventType: 'enter' | 'exit') => {
    const state = get();
    const event: GeofenceEvent = {
      poiId,
      eventType,
      timestamp: Date.now(),
    };

    set({
      eventHistory: [...state.eventHistory, event].slice(-100), // Keep last 100 events
    });
  },

  setGeofencingActive: (active: boolean) => {
    set({ isGeofencingActive: active });
  },

  reset: () => {
    set({
      enteredPOIIds: new Set(),
      lastTriggeredTimes: new Map(),
      eventHistory: [],
      isGeofencingActive: true,
    });
  },
}));
