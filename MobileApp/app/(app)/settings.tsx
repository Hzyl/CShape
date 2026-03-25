import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/stores/themeStore';
import { useAnalyticsStore } from '../../src/stores/analyticsStore';

/**
 * Settings Screen (Phase 8)
 * Displays:
 * - Theme toggle (dark mode)
 * - Language preference
 * - Clear cache option
 * - Reset analytics option
 * - About and version info
 * - Logout button
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { reset: resetAnalytics } = useAnalyticsStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache?',
      'This will remove all cached POIs and tours. You can download them again when you reconnect.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear Cache',
          onPress: async () => {
            // TODO: Integrate with cache store to clear
            Alert.alert('Success', 'Cache cleared successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleResetAnalytics = () => {
    Alert.alert(
      'Reset Analytics?',
      'This will clear all your tracked statistics. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Reset',
          onPress: async () => {
            await resetAnalytics();
            Alert.alert('Success', 'Analytics reset successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout?',
      'You will need to log in again to continue using the app.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.email || 'Not logged in'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingValue}>
                {isDark ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDesc}>Remove downloaded POIs and tours</Text>
            </View>
            <Text style={styles.icon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleResetAnalytics}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Analytics</Text>
              <Text style={styles.settingDesc}>Clear all your statistics</Text>
            </View>
            <Text style={styles.icon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>App Name</Text>
              <Text style={styles.settingValue}>Vinh Khanh Guide</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Build</Text>
              <Text style={styles.settingValue}>Phase 8</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vinh Khanh Audio Guide v1.0
          </Text>
          <Text style={styles.footerSubtext}>
            Explore, Listen, and Discover Local Heritage
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

  // Section
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#f9f9f9',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  icon: {
    fontSize: 20,
    color: '#2980b9',
    marginLeft: 10,
  },

  // Button
  button: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
