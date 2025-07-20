import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function CameraScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000', fontFamily: 'ShipporiMincho' }]}>
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: isDark ? '#fff' : '#000', fontFamily: 'CinzelDecorative' }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.permissionText, { color: isDark ? '#ccc' : '#666', fontFamily: 'ShipporiMincho' }]}>
            We need access to your camera to scan food labels
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={async () => {
              try {
                const result = await requestPermission();
                if (!result.granted) {
                  Alert.alert(
                    'Camera Permission',
                    'Camera access is required to scan labels. Please enable camera permissions in your browser settings.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                console.error('Error requesting camera permission:', error);
                Alert.alert(
                  'Permission Error',
                  'Unable to request camera permission. Please check your browser settings.',
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.gradientButton}
            >
              <Text style={[styles.buttonText, {fontFamily: 'ShipporiMincho'}]}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.permissionButton, { marginTop: 16 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backLinkText, { color: isDark ? '#ccc' : '#666', fontFamily: 'ShipporiMincho' }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready. Please try again.');
      return;
    }

    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      console.log('Photo taken successfully:', {
        uri: photo?.uri,
        width: photo?.width,
        height: photo?.height,
        exif: photo?.exif ? 'present' : 'not present'
      });

      if (photo?.uri) {
        // Validate the URI format
        if (!photo.uri.startsWith('file://') && !photo.uri.startsWith('content://') && !photo.uri.startsWith('blob:')) {
          console.warn('Unexpected URI format:', photo.uri);
        }
        
        console.log('Navigating to scan results with URI:', photo.uri);
        // Navigate to scan results with the photo URI
        router.push({
          pathname: '/scan-results',
          params: { imageUri: photo.uri }
        });
      } else {
        console.error('No photo URI received from camera');
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', `Failed to take picture: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const pickImageFromLibrary = async () => {
    try {
      // Request permission to access photo library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Image selected from library:', selectedImage.uri);
        
        // Navigate to scan results with the selected image
        router.push({
          pathname: '/scan-results',
          params: { imageUri: selectedImage.uri }
        });
      }
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to select image from library. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {fontFamily: 'CinzelDecorative'}]}>Scan Label</Text>
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={[styles.instructionText, {fontFamily: 'ShipporiMincho'}]}>
              Position the label within the frame
            </Text>
          </View>

          <View style={styles.controls}>
            <View style={styles.controlsRow}>
              <TouchableOpacity 
                style={styles.libraryButton}
                onPress={pickImageFromLibrary}
              >
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.libraryGradient}
                >
                  <Text style={styles.libraryButtonText}>📱</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.placeholderButton} />
            </View>
            <View style={styles.controlsTextContainer}>
              <Text style={[styles.controlsText, {fontFamily: 'ShipporiMincho'}]}>
                From Library
              </Text>
              <Text style={[styles.captureText, {fontFamily: 'ShipporiMincho'}]}>
                Capture Label
              </Text>
              <Text style={[styles.controlsText, {fontFamily: 'ShipporiMincho', opacity: 0}]}>
                Placeholder
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionButton: {
    width: '100%',
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 20,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: 280,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  libraryButton: {
    width: 60,
    height: 60,
  },
  libraryGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  libraryButtonText: {
    fontSize: 24,
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholderButton: {
    width: 60,
    height: 60,
  },
  controlsTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  controlsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: 60,
  },
  captureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: 80,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});