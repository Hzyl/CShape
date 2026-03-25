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
  ListRenderItem,
  FlatList,
  Modal,
} from 'react-native';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useLocation } from '../../src/hooks/useLocation';
import { useGeofence } from '../../src/hooks/useGeofence';
import { Map } from '../../src/components/Map';
import { poiService, POI } from '../../src/services/poiService';

/**
 * Map Screen - Main discovery screen (Phase 2-5 Implementation)
 * Displays:
 * - Interactive Google Map with POI markers
 * - User's current location (blue dot)
 * - Nearby POIs with different priority colors
 * - Search/filter functionality
 * - Geofencing integration (Phase 5) - auto-plays when near POI
 *
 * Navigation:
 * - Tap POI marker → navigate to POI detail screen
 * - Tap QR button → open QR scanner
 * - Tap Tours → browse tours
 * - Tap Logout → exit app
 *
 * Geofencing (Phase 5):
 * - Continuously polls GPS location
 * - Calculates distance to all POIs
 * - Auto-triggers audio when entering zone (within triggerRadius)
 * - Prevents re-triggers with 5-minute cooldown
 * - Shows badge for POIs currently in zone
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
  const [nearbyListVisible, setNearbyListVisible] = useState(false);

  // Geofencing (Phase 5)
  const { enteredPOIIds, nearbyPOIs } = useGeofence(pois);

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

  const renderNearbyItem: ListRenderItem<POI> = ({ item }) => {
    const isNow = enteredPOIIds.includes(item.id || '');
    return (
      <TouchableOpacity
        style={[styles.nearbyListItem, isNow && styles.nearbyListItemActive]}
        onPress={() => {
          setNearbyListVisible(false);
          handlePOIPress(item);
        }}
      >
        <View style={styles.nearbyListItemContent}>
          <Text style={styles.nearbyListItemName}>
            {isNow ? '🎵' : '📍'} {item.name}
          </Text>
          <Text style={styles.nearbyListItemType}>{item.type}</Text>
        </View>
        {isNow && <Text style={styles.nearbyBadge}>NOW PLAYING</Text>}
      </TouchableOpacity>
    );
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
          onPress={() => setNearbyListVisible(true)}
        >
          <Text style={styles.actionBtnText}>🎵</Text>
          <Text style={styles.actionBtnLabel}>
            Nearby ({nearbyPOIs.length})
          </Text>
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
          onPress={() => router.push('/(app)/tour')}
        >
          <Text style={styles.actionBtnText}>🗺️</Text>
          <Text style={styles.actionBtnLabel}>Tours</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={loadPOIs}>
          <Text style={styles.actionBtnText}>🔄</Text>
          <Text style={styles.actionBtnLabel}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby POIs Modal */}
      <Modal
        visible={nearbyListVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNearbyListVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {enteredPOIIds.length > 0
                  ? `🎵 Playing (${enteredPOIIds.length})`
                  : '📍 Nearby POIs'}
              </Text>
              <TouchableOpacity onPress={() => setNearbyListVisible(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Nearby POI List */}
            {nearbyPOIs.length > 0 ? (
              <FlatList
                data={nearbyPOIs}
                renderItem={renderNearbyItem}
                keyExtractor={(item) => item.id || item.name}
                style={styles.nearbyList}
              />
            ) : (
              <View style={styles.emptyNearby}>
                <Text style={styles.emptyNearbyText}>
                  No nearby POIs within 1km
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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

  // Modal Overlay & Content
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseBtn: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },

  // Nearby POI List
  nearbyList: {
    padding: 0,
  },
  nearbyListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nearbyListItemActive: {
    backgroundColor: '#f0f7ff',
  },
  nearbyListItemContent: {
    flex: 1,
  },
  nearbyListItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nearbyListItemType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  nearbyBadge: {
    backgroundColor: '#2980b9',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Empty Nearby State
  emptyNearby: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyNearbyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
