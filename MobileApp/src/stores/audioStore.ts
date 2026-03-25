import { create } from 'zustand';

export interface AudioState {
  // Current playback state
  currentPoiId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  // Status
  isLoading: boolean;
  error: string | null;

  // Settings
  language: 'vi' | 'en' | 'jp';
  playbackRate: number; // 1.0, 1.5, 2.0

  // Actions
  setCurrentPOI: (poiId: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: 'vi' | 'en' | 'jp') => void;
  setPlaybackRate: (rate: number) => void;
  reset: () => void;
}

/**
 * Audio Store - Manages audio playback state
 * Tracks current POI, playback position, language, and playback rate
 */
export const useAudioStore = create<AudioState>((set) => ({
  currentPoiId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,

  isLoading: false,
  error: null,

  language: 'vi',
  playbackRate: 1.0,

  setCurrentPOI: (poiId: string | null) => {
    set({
      currentPoiId: poiId,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    });
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLanguage: (lang: 'vi' | 'en' | 'jp') => {
    set({
      language: lang,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate });
  },

  reset: () => {
    set({
      currentPoiId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      error: null,
      language: 'vi',
      playbackRate: 1.0,
    });
  },
}));
