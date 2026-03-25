import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

/**
 * POI Detail Screen - Display POI information and audio player
 * Route: /poi/[id] where [id] is the POI ID
 *
 * Phase 3 implementation will add:
 * - Audio player with play/pause/seek controls
 * - Language switcher (VI/EN/JP)
 * - Image carousel
 * - Description in selected language
 * - Audio status badges (pending/processing/completed)
 */
export default function POIDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // TODO: Phase 3 - Fetch POI details from backend
  // const { poi, loading, error } = usePOI(id);

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

      {/* Placeholder Content */}
      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>🖼️</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.poiName}>POI Name</Text>
          <Text style={styles.poiType}>Location Type</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            POI details and description will be displayed here.{'\n\n'}
            Phase 3 will integrate:{'\n'}
            • Audio player with language switching{'\n'}
            • Progress bar and seek control{'\n'}
            • Speed adjustment (1x, 1.5x, 2x){'\n'}
            • Playback history
          </Text>
        </View>

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Language</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity style={[styles.langBtn, styles.langBtnActive]}>
              <Text style={styles.langBtnText}>🇻🇳 Vietnamese</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn}>
              <Text style={styles.langBtnText}>🇬🇧 English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn}>
              <Text style={styles.langBtnText}>🇯🇵 Japanese</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio Player Placeholder */}
        <View style={styles.audioPlayerPlaceholder}>
          <Text style={styles.audioPlaceholderEmoji}>🎵</Text>
          <Text style={styles.audioPlaceholderText}>Audio Player</Text>
          <Text style={styles.audioPlaceholderSubtext}>
            Phase 3 will add interactive playback controls
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
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 48,
  },
  infoBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  poiName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poiType: {
    fontSize: 14,
    color: '#666',
  },
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
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  langBtnActive: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  audioPlayerPlaceholder: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  audioPlaceholderEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  audioPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  audioPlaceholderSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
