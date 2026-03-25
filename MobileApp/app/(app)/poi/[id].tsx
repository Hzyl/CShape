import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { poiService, POI } from '../../../src/services/poiService';
import { AudioPlayer } from '../../../src/components/AudioPlayer';
import { useAudioStore } from '../../../src/stores/audioStore';

/**
 * POI Detail Screen - Display POI information and audio player
 * Route: /poi/[id] where [id] is the POI ID
 *
 * Phase 3 Implementation:
 * - Audio player with play/pause/seek controls
 * - Language switcher (VI/EN/JP)
 * - Image gallery
 * - Description in selected language
 * - Audio status badges (pending/processing/completed)
 */
export default function POIDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { language, setCurrentPOI } = useAudioStore();
  const [poi, setPOI] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  // Load POI details on mount
  useEffect(() => {
    const loadPOI = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id || id === 'unknown') {
          throw new Error('Invalid POI ID');
        }

        const poiData = await poiService.getPOIById(id);
        setPOI(poiData);
        setCurrentPOI(id);
      } catch (err: any) {
        console.error('Error loading POI:', err);
        const errorMsg = err.message || 'Failed to load POI. Please try again.';
        setError(errorMsg);
        Alert.alert('Error', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPOI();
  }, [id]);

  // Get description text based on selected language
  const getDescription = (): string => {
    if (!poi) return '';
    switch (language) {
      case 'en':
        return poi.descriptionEn || poi.descriptionVi;
      case 'jp':
        return poi.descriptionJp || poi.descriptionVi;
      default:
        return poi.descriptionVi;
    }
  };

  // Get audio URL based on language
  const getAudioUrl = (): string | undefined => {
    if (!poi) return undefined;
    // In Phase 3, audio URLs would vary by language
    // For now, using the default audioUrl
    return poi.audioUrl;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text style={styles.loaderText}>Loading POI...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !poi) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>POI Details</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'POI not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasImages = poi.imageUrls && poi.imageUrls.length > 0;
  const currentImage = hasImages ? poi.imageUrls![imageIndex] : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>POI Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {currentImage ? (
            <>
              <Image source={{ uri: currentImage }} style={styles.image} />
              {hasImages && poi.imageUrls!.length > 1 && (
                <View style={styles.imageNav}>
                  <TouchableOpacity
                    onPress={() =>
                      setImageIndex((i) => (i === 0 ? poi.imageUrls!.length - 1 : i - 1))
                    }
                  >
                    <Text style={styles.imageNavBtn}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageCounter}>
                    {imageIndex + 1} / {poi.imageUrls!.length}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setImageIndex((i) => (i === poi.imageUrls!.length - 1 ? 0 : i + 1))
                    }
                  >
                    <Text style={styles.imageNavBtn}>›</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
            </View>
          )}
        </View>

        {/* POI Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiType}>Type: {poi.type}</Text>
              {poi.priority && <Text style={styles.poiPriority}>★ Priority: {poi.priority}</Text>}
            </View>
            {poi.audioStatus && (
              <View
                style={[
                  styles.audioStatusBadge,
                  poi.audioStatus === 'completed' && styles.statusCompleted,
                  poi.audioStatus === 'processing' && styles.statusProcessing,
                ]}
              >
                <Text style={styles.audioStatusText}>
                  {poi.audioStatus === 'completed'
                    ? '✓'
                    : poi.audioStatus === 'processing'
                    ? '⏳'
                    : '◯'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Place</Text>
          <Text style={styles.description}>{getDescription()}</Text>
        </View>

        {/* Audio Player */}
        {poi.audioStatus === 'completed' && getAudioUrl() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio Guide</Text>
            <AudioPlayer audioUrl={getAudioUrl()} />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.noAudioBox}>
              <Text style={styles.noAudioIcon}>🎧</Text>
              <Text style={styles.noAudioText}>
                {poi.audioStatus === 'processing'
                  ? 'Audio is being prepared...'
                  : 'Audio guide coming soon'}
              </Text>
            </View>
          </View>
        )}

        {/* Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>📍 Latitude: {poi.latitude.toFixed(4)}</Text>
            <Text style={styles.locationText}>📍 Longitude: {poi.longitude.toFixed(4)}</Text>
            {poi.triggerRadius && (
              <Text style={styles.locationText}>📏 Trigger Radius: {poi.triggerRadius}m</Text>
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    color: '#2980b9',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  spacer: {
    width: 50,
  },

  // Loader & Error States
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
    paddingVertical: 8,
    backgroundColor: '#2980b9',
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },

  // Image Gallery
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  imageNav: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  imageNavBtn: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageCounter: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Info Box
  infoBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  poiName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poiType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  poiPriority: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '600',
  },

  // Audio Status Badge
  audioStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusCompleted: {
    backgroundColor: '#d4edda',
  },
  statusProcessing: {
    backgroundColor: '#fff3cd',
  },
  audioStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  // No Audio Box
  noAudioBox: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noAudioIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAudioText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  // Location Info
  locationInfo: {
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
