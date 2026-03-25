import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/hooks/useAuth';
import { tourService, Tour } from '../../../src/services/tourService';
import { poiService } from '../../../src/services/poiService';

/**
 * Tour Detail Screen (Phase 6)
 * Displays:
 * - Tour banner with name, description, stats
 * - Complete list of POI stops in order
 * - Each stop shows POI info and audio duration
 * - "Start Guided Tour" button to begin playback
 * - Maps preview showing tour route
 */
export default function TourDetailScreen() {
  const router = useRouter();
  const { id: tourId } = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Load tour details on mount
  useEffect(() => {
    loadTourDetails();
  }, [tourId]);

  const loadTourDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tourId || tourId === 'unknown') {
        setError('Invalid tour ID');
        return;
      }

      const response = await tourService.getTourById(tourId as string);
      setTour(response.data);
    } catch (err: any) {
      console.error('Error loading tour details:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load tour details.';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTour = async () => {
    if (!tour?.id) return;

    try {
      // Start tour playback session on backend
      const response = await tourService.startTourPlayback(tour.id);

      // Navigate to tour playback screen with session ID
      router.push({
        pathname: '/(app)/tour/[id]/playback',
        params: {
          id: tour.id,
          sessionId: response.data.session_id,
          stopCount: tour.stops?.length || 0,
        },
      });
    } catch (err) {
      console.error('Error starting tour:', err);
      Alert.alert('Error', 'Failed to start tour. Please try again.');
    }
  };

  const handleShareTour = async () => {
    if (!tour) return;

    try {
      await Share.share({
        message: `Check out "${tour.name}"! ${tour.description}\n\n${tour.poi_count || 0} POIs • ${tour.duration_minutes || 0} minutes`,
        title: tour.name,
        url: `vinhkhanh://tour/${tour.id}`, // Deep link format
      });
    } catch (err) {
      console.error('Error sharing tour:', err);
    }
  };

  const renderTourStop = ({ item, index }: { item: any; index: number }) => {
    const isExpanded = expandedIndex === index;

    return (
      <TouchableOpacity
        style={[styles.stopCard, isExpanded && styles.stopCardExpanded]}
        onPress={() => setExpandedIndex(isExpanded ? null : index)}
        activeOpacity={0.8}
      >
        <View style={styles.stopHeader}>
          <View style={styles.stopNumber}>
            <Text style={styles.stopNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stopHeading}>
            <Text style={styles.stopName}>{item.name || `POI ${item.poi_id}`}</Text>
            <Text style={styles.stopOrder}>Stop {index + 1} of {tour?.stops?.length || 0}</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </View>

        {isExpanded && (
          <>
            <View style={styles.stopDivider} />
            <View style={styles.stopContent}>
              {item.description && (
                <Text style={styles.stopDesc}>{item.description}</Text>
              )}
              <TouchableOpacity
                style={styles.viewPoiBtn}
                onPress={() => {
                  router.push({
                    pathname: '/(app)/poi/[id]',
                    params: { id: item.poi_id },
                  });
                }}
              >
                <Text style={styles.viewPoiBtnText}>📍 View POI Details</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text style={styles.loaderText}>Loading tour details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tour) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Tour not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadTourDetails}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tour Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🗺️</Text>
          {tour.featured && <Text style={styles.featureBadge}>⭐ Featured</Text>}
        </View>

        {/* Tour Info */}
        <View style={styles.infoSection}>
          <Text style={styles.tourName}>{tour.name}</Text>
          <Text style={styles.tourDesc}>{tour.description}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📍</Text>
              <Text style={styles.statText}>{tour.poi_count || tour.stops?.length || 0} POIs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statText}>{tour.duration_minutes || 0} min</Text>
            </View>
            {tour.difficulty && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statText}>{tour.difficulty}</Text>
              </View>
            )}
            {tour.rating && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statText}>{tour.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartTour}
            disabled={!tour.stops || tour.stops.length === 0}
          >
            <Text style={styles.startBtnText}>▶️ Start Guided Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareTour}>
            <Text style={styles.shareBtnText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        {/* Tour Stops */}
        <View style={styles.stopsSection}>
          <Text style={styles.stopsTitle}>🎯 Tour Stops ({tour.stops?.length || 0})</Text>
          {tour.stops && tour.stops.length > 0 ? (
            <FlatList
              data={tour.stops}
              renderItem={renderTourStop}
              keyExtractor={(item) => item.poi_id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyStops}>
              <Text style={styles.emptyStopsText}>No POI stops in this tour</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2980b9',
  },

  scrollContent: {
    flex: 1,
  },

  // Banner
  banner: {
    height: 160,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerIcon: {
    fontSize: 64,
  },
  featureBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffc107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tourName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  tourDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  startBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2980b9',
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },

  // Stops Section
  stopsSection: {
    padding: 16,
  },
  stopsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // Stop Card
  stopCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2980b9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  stopCardExpanded: {
    backgroundColor: '#f8fbff',
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stopHeading: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  stopOrder: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '600',
  },

  // Stop Content (Expanded)
  stopDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  stopContent: {
    paddingLeft: 44,
  },
  stopDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  viewPoiBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e8f4ff',
    borderRadius: 6,
    alignItems: 'center',
  },
  viewPoiBtnText: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '600',
  },

  // Empty State
  emptyStops: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStopsText: {
    fontSize: 14,
    color: '#999',
  },

  // Error & Loading
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
});
