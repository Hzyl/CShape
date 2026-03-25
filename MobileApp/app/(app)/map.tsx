import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useLocation } from '../../src/hooks/useLocation';
import { Map } from '../../src/components/Map';
import { poiService, POI } from '../../src/services/poiService';

/**
 * Map Screen - Main discovery screen (Phase 2 Implementation)
 * Displays:
 * - Interactive Google Map with POI markers
 * - User's current location
 * - Nearby POIs with different priority colors
 * - Search/filter functionality
 * - Quick navigation to other screens
 *
 * Navigation:
 * - Tap POI marker → navigate to POI detail screen
 * - Tap QR button → open QR scanner
 * - Tap Tours → browse tours
 * - Tap Logout → exit app
 */
export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const { user, logout, isAuthenticated } = useAuth();
  const { latitude: userLat, longitude: userLng, hasLocationPermission } = useLocation();

  // POI & UI state
  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPois, setFilteredPois] = useState<POI[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Load POIs on mount
  useEffect(() => {
    loadPOIs();
  }, []);

  // Filter POIs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPois(pois);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = pois.filter(
        (poi) =>
          poi.name.toLowerCase().includes(query) ||
          poi.descriptionVi?.toLowerCase().includes(query)
      );
      setFilteredPois(filtered);
    }
  }, [searchQuery, pois]);

  const loadPOIs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch POIs from backend
      const response = await poiService.getAllPOIs(1, 100);
      setPOIs(response.data || []);
      setFilteredPois(response.data || []);
    } catch (err: any) {
      console.error('Error loading POIs:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load POIs. Please try again.';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePOIPress = (poi: POI) => {
    // Navigate to POI detail screen
    router.push({
      pathname: '/(app)/poi/[id]',
      params: { id: poi.id || 'unknown' },
    });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleLocationPermissionAlert = () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Location Permission',
        'Please enable location services to see your position on the map.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vinh Khanh Guide</Text>
          <Text style={styles.subtitle}>
            {userLat && userLng ? '📍 Tracking' : '📍 Location Off'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Location Permission Warning */}
      {!hasLocationPermission && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Enable location to see your position
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search POIs..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.poiCount}>{filteredPois.length} POIs</Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading && !error ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2980b9" />
            <Text style={styles.loaderText}>Loading POIs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadPOIs}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Map
            ref={mapRef}
            pois={filteredPois}
            onPoiPress={handlePOIPress}
            loading={loading}
          />
        )}
      </View>

      {/* Quick Actions & Navigation */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLocationPermissionAlert}
        >
          <Text style={styles.actionBtnText}>📍</Text>
          <Text style={styles.actionBtnLabel}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(app)/qr-scanner')}
        >
          <Text style={styles.actionBtnText}>📱</Text>
          <Text style={styles.actionBtnLabel}>QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(app)/tours')}
        >
          <Text style={styles.actionBtnText}>🎯</Text>
          <Text style={styles.actionBtnLabel}>Tours</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={loadPOIs}>
          <Text style={styles.actionBtnText}>🔄</Text>
          <Text style={styles.actionBtnLabel}>Refresh</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Warning Banner
  warningBanner: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },

  // Search Container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    marginRight: 8,
  },
  poiCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  // Map Container
  mapContainer: {
    flex: 1,
  },
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

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionBtnText: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionBtnLabel: {
    fontSize: 10,
    color: '#2980b9',
    fontWeight: '600',
  },
});
