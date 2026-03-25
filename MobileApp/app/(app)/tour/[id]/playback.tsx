import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AudioPlayer } from '../../../../src/components/AudioPlayer';
import { tourService, Tour } from '../../../../src/services/tourService';
import { poiService, POI } from '../../../../src/services/poiService';
import { useAudioStore } from '../../../../src/stores/audioStore';

/**
 * Tour Playback Screen (Phase 6)
 * Displays:
 * - Current stop number and progress
 * - POI details and image
 * - Audio player integrated
 * - Next/Previous buttons to navigate stops
 * - Tour completion tracking
 * - Auto-advance on audio finish (optional)
 */
export default function TourPlaybackScreen() {
  const router = useRouter();
  const { id: tourId, sessionId } = useLocalSearchParams();
  const { language } = useAudioStore();

  const [tour, setTour] = useState<Tour | null>(null);
  const [pois, setPOIs] = useState<Map<string, POI>>(new Map());
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poiLoading, setPoiLoading] = useState(false);

  const sessionIdRef = useRef<string>(typeof sessionId === 'string' ? sessionId : '');
  const playbackStartRef = useRef<number>(Date.now());

  // Load tour and initial POI
  useEffect(() => {
    loadTourAndPOI();
  }, [tourId]);

  // Track audio playback time for each POI
  useEffect(() => {
    const currentStop = tour?.stops?.[currentStopIndex];
    if (currentStop) {
      playbackStartRef.current = Date.now();
    }
  }, [currentStopIndex]);

  const loadTourAndPOI = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tourId || tourId === 'unknown') {
        setError('Invalid tour ID');
        return;
      }

      // Load tour details
      const tourRes = await tourService.getTourById(tourId as string);
      setTour(tourRes.data);

      // Load first POI
      if (tourRes.data.stops && tourRes.data.stops.length > 0) {
        await loadPOIForStop(tourRes.data.stops[0]);
      }
    } catch (err: any) {
      console.error('Error loading tour:', err);
      setError(err.response?.data?.message || 'Failed to load tour');
    } finally {
      setLoading(false);
    }
  };

  const loadPOIForStop = async (stop: any) => {
    try {
      setPoiLoading(true);
      // poiService.getPOIById already returns POI, not wrapped in response
      const poi = await poiService.getPOIById(stop.poi_id);
      const newPois = new Map(pois);
      newPois.set(stop.poi_id, poi);
      setPOIs(newPois);
    } catch (err) {
      console.error('Error loading POI:', err);
    } finally {
      setPoiLoading(false);
    }
  };

  const handleNextStop = async () => {
    if (!tour?.stops) return;

    // Track current POI playback time
    if (sessionIdRef.current && tour.stops[currentStopIndex]) {
      const duration = Math.floor((Date.now() - playbackStartRef.current) / 1000);
      try {
        await tourService.trackPOIInTour(
          sessionIdRef.current,
          tour.stops[currentStopIndex].poi_id,
          duration
        );
      } catch (err) {
        console.error('Error tracking POI:', err);
      }
    }

    if (currentStopIndex < tour.stops.length - 1) {
      const nextIndex = currentStopIndex + 1;
      setCurrentStopIndex(nextIndex);
      await loadPOIForStop(tour.stops[nextIndex]);
    } else {
      // Tour finished
      handleTourComplete();
    }
  };

  const handlePreviousStop = async () => {
    if (currentStopIndex > 0) {
      const prevIndex = currentStopIndex - 1;
      setCurrentStopIndex(prevIndex);
      if (tour?.stops) {
        await loadPOIForStop(tour.stops[prevIndex]);
      }
    }
  };

  const handleTourComplete = async () => {
    try {
      // End tour session on backend
      if (sessionIdRef.current) {
        const totalDuration = Math.floor((Date.now() - playbackStartRef.current) / 1000);
        await tourService.endTourPlayback(sessionIdRef.current, totalDuration);
      }

      Alert.alert(
        'Tour Completed! 🎉',
        `You've completed "${tour?.name}"!\n\nThanks for exploring with us.`,
        [
          { text: 'Back to Tours', onPress: () => router.replace('/(app)/tour') },
          { text: 'Back to Map', onPress: () => router.replace('/(app)/map') },
        ]
      );
    } catch (err) {
      console.error('Error ending tour:', err);
      router.replace('/(app)/tour');
    }
  };

  const handleExitTour = () => {
    Alert.alert(
      'Exit Tour?',
      'Your progress will not be saved if you exit now.',
      [
        { text: 'Continue Tour', onPress: () => {} },
        { text: 'Exit', onPress: () => router.replace('/(app)/tour'), style: 'destructive' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text style={styles.loaderText}>Starting tour...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tour || !tour.stops || tour.stops.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Tour not available'}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace('/(app)/tour')}
          >
            <Text style={styles.retryText}>Back to Tours</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStop = tour.stops[currentStopIndex];
  const currentPOI = pois.get(currentStop.poi_id);
  const audioUrl = currentPOI?.audioUrl;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitTour} style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.tourTitle}>{tour.name}</Text>
        <Text style={styles.progress}>
          Stop {currentStopIndex + 1}/{tour.stops.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStopIndex + 1) / tour.stops.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* POI Details */}
        {poiLoading ? (
          <View style={styles.loadingPOI}>
            <ActivityIndicator size="large" color="#2980b9" />
            <Text style={styles.loadingPOIText}>Loading POI details...</Text>
          </View>
        ) : currentPOI ? (
          <>
            {/* POI Banner */}
            <View style={styles.poiBanner}>
              <Text style={styles.poiBannerIcon}>📍</Text>
            </View>

            {/* POI Info */}
            <View style={styles.poiInfo}>
              <Text style={styles.poiName}>{currentPOI.name}</Text>
              <Text style={styles.poiType}>{currentPOI.type}</Text>

              {/* Description */}
              <Text style={styles.description}>
                {language === 'vi'
                  ? currentPOI.descriptionVi
                  : language === 'en'
                  ? currentPOI.descriptionEn || currentPOI.descriptionVi
                  : currentPOI.descriptionJp || currentPOI.descriptionVi}
              </Text>
            </View>

            {/* Audio Player */}
            {audioUrl && (
              <View style={styles.playerSection}>
                <AudioPlayer audioUrl={audioUrl} />
              </View>
            )}

            {/* Stop Details */}
            <View style={styles.stopDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📍</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {currentPOI.latitude.toFixed(4)}, {currentPOI.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📏</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Trigger Radius</Text>
                  <Text style={styles.detailValue}>{currentPOI.triggerRadius || 100}m</Text>
                </View>
              </View>

              {currentPOI.priority && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⭐</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Priority</Text>
                    <Text style={styles.detailValue}>Level {currentPOI.priority}</Text>
                  </View>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.poiError}>
            <Text style={styles.poiErrorText}>POI details not available</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navBtn, currentStopIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePreviousStop}
          disabled={currentStopIndex === 0}
        >
          <Text style={styles.navBtnText}>← Previous</Text>
        </TouchableOpacity>

        <View style={styles.stopCounter}>
          <Text style={styles.stopCounterText}>
            {currentStopIndex + 1} / {tour.stops.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navBtn, styles.nextBtn]}
          onPress={handleNextStop}
        >
          <Text style={styles.navBtnText}>
            {currentStopIndex === tour.stops.length - 1 ? 'Finish' : 'Next'} →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exitBtn: {
    marginBottom: 8,
  },
  exitBtnText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  progress: {
    fontSize: 12,
    color: '#666',
  },

  // Progress Bar
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2980b9',
    borderRadius: 3,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Loading POI
  loadingPOI: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingPOIText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  // POI Banner
  poiBanner: {
    height: 140,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  poiBannerIcon: {
    fontSize: 56,
  },

  // POI Info
  poiInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  poiName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  poiType: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Audio Player
  playerSection: {
    marginBottom: 16,
  },

  // Stop Details
  stopDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  // POI Error
  poiError: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  poiErrorText: {
    fontSize: 14,
    color: '#999',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  nextBtn: {
    backgroundColor: '#2980b9',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  nextBtn_Text: {
    color: '#fff',
  },
  stopCounter: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  stopCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2980b9',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2980b9',
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
