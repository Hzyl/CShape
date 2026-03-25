import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * QR Scanner Screen - Scan QR codes to view POI details
 * Phase 4 implementation will add:
 * - Camera integration with expo-camera
 * - QR code detection with expo-barcode-scanner
 * - Hash lookup via GET /api/v1/poi/qr/{hash}
 * - Auto-navigation to POI detail screen
 */
export default function QRScannerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder */}
      <View style={styles.contentContainer}>
        <Text style={styles.placeholderEmoji}>📱</Text>
        <Text style={styles.placeholderText}>QR Scanner Coming Soon</Text>
        <Text style={styles.placeholderSubtext}>
          Phase 4 will integrate device camera for QR code scanning
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>
          1. Point camera at QR code{'\n'}
          2. Scanner detects the code{'\n'}
          3. View POI details instantly
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#ddd',
    fontSize: 13,
    lineHeight: 20,
  },
});
