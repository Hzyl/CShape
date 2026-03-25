import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAudioStore } from '../stores/audioStore';

interface AudioPlayerProps {
  audioUrl?: string;
  onLanguageChange?: (lang: 'vi' | 'en' | 'jp') => void;
}

/**
 * Audio Player Component
 * Full-featured audio playback with:
 * - Play/pause button
 * - Progress bar with current time and duration
 * - Language selector (VI/EN/JP)
 * - Playback speed control (1x, 1.5x, 2x)
 * - Seek functionality
 */
export const AudioPlayer = React.memo(({ audioUrl, onLanguageChange }: AudioPlayerProps) => {
  const { play, pause, seek, isPlaying, currentTime, duration, isLoading, error } =
    useAudioPlayer(audioUrl);

  const { language, playbackRate, setLanguage, setPlaybackRate } = useAudioStore();

  const handleLanguageChange = (lang: 'vi' | 'en' | 'jp') => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  const handleSpeedChange = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Play/Pause Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.playBtn, isLoading && styles.playBtnDisabled]}
          onPress={isPlaying ? pause : play}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.timeInfo}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.duration}>{formatTime(duration)}</Text>
        </View>

        <TouchableOpacity
          style={styles.speedBtn}
          onPress={handleSpeedChange}
          disabled={isLoading}
        >
          <Text style={styles.speedBtnText}>{playbackRate}x</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <TouchableOpacity
          style={styles.progressBarBg}
          onPress={(e) => {
            const { locationX } = e.nativeEvent;
            const newTime = (locationX / (320 - 32)) * duration; // Account for padding
            seek(Math.max(0, Math.min(newTime, duration)));
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
              },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>Audio Language:</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              language === 'vi' && styles.langBtnActive,
            ]}
            onPress={() => handleLanguageChange('vi')}
          >
            <Text
              style={[
                styles.langBtnText,
                language === 'vi' && styles.langBtnTextActive,
              ]}
            >
              🇻🇳 VI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              language === 'en' && styles.langBtnActive,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.langBtnText,
                language === 'en' && styles.langBtnTextActive,
              ]}
            >
              🇬🇧 EN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              language === 'jp' && styles.langBtnActive,
            ]}
            onPress={() => handleLanguageChange('jp')}
          >
            <Text
              style={[
                styles.langBtnText,
                language === 'jp' && styles.langBtnTextActive,
              ]}
            >
              🇯🇵 JP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    marginHorizontal: 0,
  },

  // Error
  errorBox: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 12,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  playBtnIcon: {
    fontSize: 18,
  },
  timeInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  currentTime: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  separator: {
    fontSize: 12,
    color: '#999',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  speedBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },

  // Progress Bar
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2980b9',
  },

  // Language Selector
  languageContainer: {
    marginTop: 8,
  },
  languageLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  langBtnTextActive: {
    color: '#fff',
  },
});
