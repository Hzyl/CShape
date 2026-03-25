import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useLocationStore } from '../stores/locationStore';
import { POI } from '../services/poiService';

interface MapProps {
  pois: POI[];
  onPoiPress?: (poi: POI) => void;
  loading?: boolean;
}

const DEFAULT_LATITUDE = 10.7769; // Vinh Khanh, Ho Chi Minh City
const DEFAULT_LONGITUDE = 106.6956;
const DEFAULT_ZOOM = 15;

/**
 * Map Component - Google Maps wrapper for Expo
 * Shows user location and POI markers
 *
 * Features:
 * - Current user location (blue dot)
 * - POI markers
 * - Auto-center on user location when available
 * - Tap POI marker to view details
 */
export const Map = React.forwardRef<MapView, MapProps>(
  ({ pois, onPoiPress, loading = false }, ref) => {
    const { latitude: userLat, longitude: userLng } = useLocation();
    const [initialRegion, setInitialRegion] = useState({
      latitude: userLat || DEFAULT_LATITUDE,
      longitude: userLng || DEFAULT_LONGITUDE,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    // Update initial region when user location is available
    useEffect(() => {
      if (userLat && userLng) {
        setInitialRegion({
          latitude: userLat,
          longitude: userLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }, [userLat, userLng]);

    return (
      <View style={styles.container}>
        <MapView
          ref={ref}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          followsUserLocation={false}
          showsMyLocationButton={true}
        >
          {/* User location marker */}
          {userLat && userLng && (
            <Marker
              coordinate={{
                latitude: userLat,
                longitude: userLng,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}

          {/* POI markers */}
          {pois.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.latitude,
                longitude: poi.longitude,
              }}
              title={poi.name}
              description={poi.descriptionVi}
              onPress={() => onPoiPress?.(poi)}
              pinColor={getPinColor(poi.priority)}
            />
          ))}
        </MapView>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2980b9" />
          </View>
        )}
      </View>
    );
  }
);

Map.displayName = 'Map';

/**
 * Get marker color based on POI priority
 * Priority 1 = Red (most important)
 * Priority 2-3 = Orange
 * Priority 4+ = Yellow (least important)
 */
function getPinColor(priority: number): string {
  if (priority === 1) return 'red';
  if (priority <= 3) return 'orange';
  return 'yellow';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
