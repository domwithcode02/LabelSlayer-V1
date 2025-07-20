
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  useEffect(() => {
    // Only start animation once image is loaded
    if (imageLoaded) {
      // Start the fade in and scale animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // After showing for 1.8 seconds, fade out and finish
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [imageLoaded, fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E', '#FFD700']}
              style={styles.logoGradient}
            >
              <Image 
                source={require('@/assets/images/label-slayer-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)} // Fallback to continue even if image fails
              />
            </LinearGradient>
          </View>

          <Text style={fontsLoaded ? styles.title : styles.titleFallback}>
            The Label Slayer
          </Text>
          
          <Text style={fontsLoaded ? styles.subtitle : styles.subtitleFallback}>
            Your Food's Truth Detector
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 36,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1.5,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  titleFallback: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1.5,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#00FF00',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitleFallback: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF00',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
