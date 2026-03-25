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
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { tourService, Tour } from '../../src/services/tourService';

/**
 * Tour Discovery Screen (Phase 6)
 * Displays:
 * - Featured/recommended tours at top
 * - All available tours in a searchable list
 * - Tour cards with image, name, POI count, duration
 * - Tap to view tour details and start guided tour
 */
export default function TourScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Load tours on mount
  useEffect(() => {
    loadTours();
  }, []);

  // Filter tours based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTours(allTours);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allTours.filter((tour) =>
        tour.name.toLowerCase().includes(query) ||
        tour.description?.toLowerCase().includes(query)
      );
      setFilteredTours(filtered);
    }
  }, [searchQuery, allTours]);

  const loadTours = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured tours first
      const featuredRes = await tourService.getFeaturedTours();
      setFeaturedTours(featuredRes.data || []);

      // Load all tours
      const allRes = await tourService.getAllTours(1, 100);
      setAllTours(allRes.data || []);
      setFilteredTours(allRes.data || []);
    } catch (err: any) {
      console.error('Error loading tours:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load tours. Please try again.';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTourPress = (tour: Tour) => {
    // Navigate to tour detail screen
    router.push({
      pathname: '/(app)/tour/[id]',
      params: { id: tour.id || 'unknown' },
    });
  };

  const renderFeaturedTour = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleTourPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.featuredImage}>
        <Text style={styles.featuredBadge}>⭐ Featured</Text>
        <Text style={styles.featuredImagePlaceholder}>🗺️</Text>
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle}>{item.name}</Text>
        <Text style={styles.featuredDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.metaItem}>📍 {item.poi_count || 0} POIs</Text>
          <Text style={styles.metaItem}>⏱️ {item.duration_minutes || 0} min</Text>
          {item.rating && <Text style={styles.metaItem}>⭐ {item.rating.toFixed(1)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => handleTourPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.tourCardImage}>
        <Text style={styles.tourImagePlaceholder}>🗺️</Text>
      </View>
      <View style={styles.tourCardContent}>
        <Text style={styles.tourName}>{item.name}</Text>
        <Text style={styles.tourDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.tourMeta}>
          <Text style={styles.tourMetaItem}>📍 {item.poi_count || 0} POIs</Text>
          <Text style={styles.tourMetaItem}>⏱️ {item.duration_minutes || 0}m</Text>
        </View>
      </View>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  if (loading && !allTours.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text style={styles.loaderText}>Loading tours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !allTours.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadTours}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guided Tours</Text>
        <Text style={styles.subtitle}>📍 {allTours.length} tours available</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tours..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Featured Tours Section */}
        {featuredTours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Featured Tours</Text>
            <FlatList
              data={featuredTours}
              renderItem={renderFeaturedTour}
              keyExtractor={(item) => item.id || item.name}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* All Tours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ All Tours</Text>
          {filteredTours.length > 0 ? (
            <FlatList
              data={filteredTours}
              renderItem={renderTourCard}
              keyExtractor={(item) => item.id || item.name}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateText}>No tours found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or reload
              </Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
  },

  // Content
  scrollContent: {
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // Featured Tour Card
  featuredCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    height: 120,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  featuredImagePlaceholder: {
    fontSize: 48,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    fontSize: 11,
    color: '#2980b9',
    fontWeight: '600',
  },

  // Tour Card
  tourCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tourCardImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  tourImagePlaceholder: {
    fontSize: 40,
  },
  tourCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tourName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  tourDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  tourMetaItem: {
    fontSize: 11,
    color: '#2980b9',
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#2980b9',
    alignSelf: 'center',
  },

  // Loading & Error
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

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
