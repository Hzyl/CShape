import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useAudioStore } from '../stores/audioStore';

/**
 * Custom hook for audio playback control
 * Integrates with expo-av Sound API
 * Handles play, pause, seek, rate changes
 *
 * Usage:
 *   const { play, pause, seek, changeLanguage } = useAudioPlayer('poi-123', 'https://...');
 */
export const useAudioPlayer = (audioUrl: string | undefined) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentTime,
    duration,
    isPlaying,
    isLoading,
    error,
    playbackRate,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    setError,
  } = useAudioStore();

  // Load audio when URL changes
  useEffect(() => {
    const loadAudio = async () => {
      if (!audioUrl) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Enable audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        // Unload previous sound if exists
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        // Load new audio
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false }
        );

        soundRef.current = sound;

        // Set duration when loaded
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDuration(Math.floor(status.durationMillis / 1000));
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading audio:', err);
        setError(err.message || 'Failed to load audio');
        setIsLoading(false);
      }
    };

    loadAudio();

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [audioUrl]);

  // Poll playback position every 100ms
  useEffect(() => {
    if (!soundRef.current || !isPlaying) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setCurrentTime(Math.floor(status.positionMillis / 1000));

            // Auto-stop when finished
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        } catch (err) {
          // Ignore polling errors
        }
      }
    }, 100);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Apply playback rate when changed
  useEffect(() => {
    if (soundRef.current && isLoading === false) {
      soundRef.current.setRateAsync(playbackRate, true);
    }
  }, [playbackRate]);

  const play = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('Error playing audio:', err);
      setError(err.message || 'Failed to play audio');
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error('Error pausing audio:', err);
    }
  };

  const seek = async (positionSeconds: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionSeconds * 1000);
        setCurrentTime(positionSeconds);
      }
    } catch (err: any) {
      console.error('Error seeking audio:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.pauseAsync();
            await soundRef.current.unloadAsync();
          } catch (err) {
            // Ignore cleanup errors
          }
        }
      };
      cleanup();
    };
  }, []);

  return {
    play,
    pause,
    seek,
    currentTime,
    duration,
    isPlaying,
    isLoading,
    error,
  };
};
