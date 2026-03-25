import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { poiService } from '../../../src/services/poiService';

/**
 * QR Scanner Screen - Scan QR codes to view POI details
 * Phase 4 Implementation:
 * - Camera integration with proper permissions
 * - QR/barcode detection
 * - Hash lookup via GET /api/v1/poi/qr/{hash}
 * - Auto-navigation to POI detail screen
 * - Spam protection (ignore same QR within 10s)
 */
export default function QRScannerScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedHash, setLastScannedHash] = useState<string | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<number>(0);
  const [flashOn, setFlashOn] = useState(false);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async (scannedData: {
    type: string;
    data: string;
  }) => {
    // Spam protection: ignore same QR scanned within 10 seconds
    const now = Date.now();
    if (
      scannedData.data === lastScannedHash &&
      now - lastScannedTime < 10000
    ) {
      return;
    }

    setLastScannedHash(scannedData.data);
    setLastScannedTime(now);

    // Pause scanning while processing
    setIsScanning(false);
    setIsLoading(true);

    try {
      // Extract QR hash from data
      // Format: vinhkhanh://poi/{hash} or just plain hash
      let hash = scannedData.data;

      if (hash.startsWith('vinhkhanh://poi/')) {
        hash = hash.replace('vinhkhanh://poi/', '');
      } else if (hash.includes('/')) {
        hash = hash.split('/').pop() || hash;
      }

      // Lookup POI by QR hash
      const poi = await poiService.getPOIByQRHash(hash);

      if (poi && poi.id) {
        // Navigate to POI detail screen
        router.push({
          pathname: '/(app)/poi/[id]',
          params: { id: poi.id },
        });
        setIsScanning(true); // Re-enable scanner when navigating
      } else {
        Alert.alert('POI Not Found', `No POI found for QR hash: ${hash}`, [
          { text: 'Scan Again', onPress: () => setIsScanning(true) },
        ]);
      }
    } catch (error: any) {
      console.error('Error scanning QR:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to lookup QR code';

      Alert.alert('Scan Error', errorMsg, [
        { text: 'Scan Again', onPress: () => setIsScanning(true) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan QR codes
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
          >
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera access not granted
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
          >
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        onBarcodeScanned={
          isScanning && !isLoading
            ? handleBarcodeScanned
            : undefined
        }
      >
        {/* Overlay Frame */}
        <View style={styles.overlay}>
          {/* Top Dark Area */}
          <View style={styles.topDark} />

          {/* Middle Scanner Area */}
          <View style={styles.middleRow}>
            <View style={styles.sideDark} />
            <View style={styles.scannerFrameContainer}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <Text style={styles.scannerHint}>Point at QR code</Text>
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <View style={styles.sideDark} />
          </View>

          {/* Bottom Dark Area */}
          <View style={styles.bottomDark}>
            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Text style={styles.controlBtnText}>
                  {flashOn ? '🔦 Flash On' : '🔦 Flash Off'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.controlBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Looking up QR code...</Text>
              </View>
            )}

            {/* Instructions */}
            <Text style={styles.instruction}>
              {isScanning ? 'Align QR code within frame' : 'Processing...'}
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Overlay (dark areas + scanner frame)
  overlay: {
    flex: 1,
    width: '100%',
  },
  topDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  sideDark: {
    flex: 0.15,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerFrameContainer: {
    flex: 0.7,
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  scannerHint: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Corner indicators
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#00ff00',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: '#00ff00',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#00ff00',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#00ff00',
  },

  // Bottom section
  bottomDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  controlBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
  },

  // Instruction
  instruction: {
    color: '#aaa',
    fontSize: 11,
    fontStyle: 'italic',
  },

  // Permissions
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2980b9',
    borderRadius: 6,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
