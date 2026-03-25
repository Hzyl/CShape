import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { useAnalyticsStore } from '../../src/stores/analyticsStore';

/**
 * User Analytics Screen (Phase 7)
 * Displays:
 * - User engagement statistics
 * - POis viewed, audio played, tours completed
 * - Favorite POIs and language
 * - Total time spent
 * - Recent activity summary
 */
export default function AnalyticsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getSummary } = useAnalytics();
  const { eventQueue } = useAnalyticsStore();

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Calculate analytics on mount
  useEffect(() => {
    setTimeout(() => {
      const stats = getSummary();
      setSummary(stats);
      setLoading(false);
    }, 300);
  }, [eventQueue]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const topPOIs = summary
    ? Array.from(summary.favorite_pois.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  if (loading || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Statistics</Text>
          <Text style={styles.subtitle}>Track your exploration journey</Text>
        </View>

        {/* Main Stats - Grid */}
        <View style={styles.statsGrid}>
          {/* POIs Viewed */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statValue}>{summary.total_pois_viewed}</Text>
            <Text style={styles.statLabel}>POIs Viewed</Text>
          </View>

          {/* Audio Played */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎵</Text>
            <Text style={styles.statValue}>{summary.total_audio_played}</Text>
            <Text style={styles.statLabel}>Audios Played</Text>
          </View>

          {/* Tours Completed */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🗺️</Text>
            <Text style={styles.statValue}>{summary.total_tours_completed}</Text>
            <Text style={styles.statLabel}>Tours Done</Text>
          </View>

          {/* QR Scans */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📱</Text>
            <Text style={styles.statValue}>{summary.total_qr_scans}</Text>
            <Text style={styles.statLabel}>QR Scans</Text>
          </View>
        </View>

        {/* Total Audio Duration */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⏱️</Text>
            <Text style={styles.sectionTitle}>Total Listening Time</Text>
          </View>
          <Text style={styles.durationValue}>
            {formatDuration(summary.total_audio_duration)}
          </Text>
          <Text style={styles.durationDesc}>
            {summary.total_audio_played} audio sessions
          </Text>
        </View>

        {/* Favorite Language */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌐</Text>
            <Text style={styles.sectionTitle}>Preferred Language</Text>
          </View>
          <View style={styles.languageBox}>
            <Text style={styles.languageFlag}>
              {summary.favorite_language === 'vi'
                ? '🇻🇳'
                : summary.favorite_language === 'en'
                ? '🇬🇧'
                : '🇯🇵'}
            </Text>
            <Text style={styles.languageName}>
              {summary.favorite_language === 'vi'
                ? 'Vietnamese'
                : summary.favorite_language === 'en'
                ? 'English'
                : 'Japanese'}
            </Text>
          </View>
        </View>

        {/* Top POIs */}
        {topPOIs.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⭐</Text>
              <Text style={styles.sectionTitle}>Top Visited POIs</Text>
            </View>
            {topPOIs.map((entry, index) => (
              <View key={entry[0]} style={styles.topPoiItem}>
                <Text style={styles.topPoiRank}>#{index + 1}</Text>
                <View style={styles.topPoiInfo}>
                  <Text style={styles.topPoiId}>{entry[0]}</Text>
                  <View style={styles.topPoiBar}>
                    <View
                      style={[
                        styles.topPoiBarFill,
                        {
                          width: `${(entry[1] / topPOIs[0][1]) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.topPoiCount}>{entry[1]}x</Text>
              </View>
            ))}
          </View>
        )}

        {/* Geofencing Stats */}
        {summary.total_geofence_triggers > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📍</Text>
              <Text style={styles.sectionTitle}>Geofence Entries</Text>
            </View>
            <Text style={styles.geofenceValue}>{summary.total_geofence_triggers}</Text>
            <Text style={styles.geofenceDesc}>Automatic POI entries detected</Text>
          </View>
        )}

        {/* Empty State */}
        {summary.total_pois_viewed === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyText}>Start exploring!</Text>
            <Text style={styles.emptyDesc}>
              View POIs on the map or scan QR codes to see your stats appear here
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(app)/map')}
            >
              <Text style={styles.emptyBtnText}>Explore Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Last Updated */}
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(summary.last_updated).toLocaleString()}
          </Text>
          <Text style={styles.cachedNote}>
            {eventQueue.length > 0
              ? `${eventQueue.length} events pending sync`
              : 'All events synced'}
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2980b9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  // Duration Section
  durationValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2980b9',
    marginBottom: 4,
  },
  durationDesc: {
    fontSize: 12,
    color: '#999',
  },

  // Language Section
  languageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fbff',
    borderRadius: 8,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Top POI Item
  topPoiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topPoiRank: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2980b9',
    width: 30,
  },
  topPoiInfo: {
    flex: 1,
    marginLeft: 8,
  },
  topPoiId: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  topPoiBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  topPoiBarFill: {
    height: '100%',
    backgroundColor: '#2980b9',
  },
  topPoiCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2980b9',
    marginLeft: 8,
  },

  // Geofence Section
  geofenceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2980b9',
    marginBottom: 4,
  },
  geofenceDesc: {
    fontSize: 12,
    color: '#999',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2980b9',
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  lastUpdated: {
    fontSize: 11,
    color: '#999',
  },
  cachedNote: {
    fontSize: 11,
    color: '#2980b9',
    fontWeight: '600',
    marginTop: 4,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
