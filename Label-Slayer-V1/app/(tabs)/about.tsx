
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = true; // Always dark mode as per design spec
  
  const mascotScale = useRef(new Animated.Value(0.8)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mascotScale, {
        toValue: 1,
        tension: 80,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.content}>
            <View style={styles.heroSection}>
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: mascotScale }] }
                ]}
              >
                <LinearGradient
                  colors={['#FF6B35', '#F7931E', '#FFD700']}
                  style={styles.logoGradient}
                >
                  <Image 
                    source={require('@/assets/images/label-slayer-logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
                
                
              </Animated.View>

              <Text style={fontsLoaded ? styles.title : styles.titleFallback}>
                The Label Slayer
              </Text>
              <Text style={fontsLoaded ? styles.tagline : styles.taglineFallback}>
                Your Food's Truth Detector
              </Text>
            </View>

            <Animated.View style={[styles.missionSection, { opacity: fadeIn }]}>
              <Text style={styles.sectionTitle}>
                🎯 Our Mission
              </Text>
              <Text style={fontsLoaded ? styles.missionText : styles.missionTextFallback}>
                We made this app so you don't get played by food companies. No BS, just facts—and a little roast.
              </Text>
              <View style={styles.attitudeBox}>
                <Text style={styles.attitudeText}>
                  "We believe you deserve to know what's really in your food, playa." 😤
                </Text>
              </View>
            </Animated.View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>
                ⚡ How We Slay Labels
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={['#00FF00', '#32CD32']}
                    style={styles.featureIcon}
                  >
                    <Text style={styles.featureEmoji}>📸</Text>
                  </LinearGradient>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>
                      Instant Scanning
                    </Text>
                    <Text style={fontsLoaded ? styles.featureDescription : styles.featureDescriptionFallback}>
                      Point, shoot, and get results in seconds. No typing, no searching.
                    </Text>
                    <Text style={styles.featureAttitude}>
                      "Faster than you can say 'what's maltodextrin?'" 💨
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.featureIcon}
                  >
                    <Text style={styles.featureEmoji}>🔥</Text>
                  </LinearGradient>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>
                      Leon-Style Roasts
                    </Text>
                    <Text style={fontsLoaded ? styles.featureDescription : styles.featureDescriptionFallback}>
                      No corporate fluff. Just straight facts with attitude.
                    </Text>
                    <Text style={styles.featureAttitude}>
                      "We tell you what's up, no sugarcoating!" 🗣️
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.featureIcon}
                  >
                    <Text style={styles.featureEmoji}>🧠</Text>
                  </LinearGradient>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>
                      Smart Analysis
                    </Text>
                    <Text style={fontsLoaded ? styles.featureDescription : styles.featureDescriptionFallback}>
                      AI that actually knows food from chemicals.
                    </Text>
                    <Text style={styles.featureAttitude}>
                      "Smarter than that food company trying to fool you!" 🤖
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.brandSection}>
              <Text style={styles.sectionTitle}>
                💪 Why Label Slayer?
              </Text>
              <Text style={fontsLoaded ? styles.brandText : styles.brandTextFallback}>
                We're not here to shame your food choices or make you feel guilty. We're here to 
                empower you with knowledge. Whether you're a health enthusiast or just want to 
                know what you're eating, Label Slayer gives you the facts without the fuss.
              </Text>

              <View style={styles.brandValues}>
                <View style={styles.valueItem}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.valueIcon}
                  >
                    <Text style={styles.valueEmoji}>🎯</Text>
                  </LinearGradient>
                  <Text style={styles.valueText}>
                    Honest & Direct
                  </Text>
                  <Text style={styles.valueSubtext}>
                    "No cap, just facts"
                  </Text>
                </View>
                
                <View style={styles.valueItem}>
                  <LinearGradient
                    colors={['#00FF00', '#32CD32']}
                    style={styles.valueIcon}
                  >
                    <Text style={styles.valueEmoji}>⚡</Text>
                  </LinearGradient>
                  <Text style={styles.valueText}>
                    Fast & Simple
                  </Text>
                  <Text style={styles.valueSubtext}>
                    "Results in 10 seconds"
                  </Text>
                </View>
                
                <View style={styles.valueItem}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.valueIcon}
                  >
                    <Text style={styles.valueEmoji}>💪</Text>
                  </LinearGradient>
                  <Text style={styles.valueText}>
                    Empowering
                  </Text>
                  <Text style={styles.valueSubtext}>
                    "Knowledge is power"
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.ctaSection}>
              <View style={styles.finalMascot}>
                <Text style={styles.finalMascotEmoji}>😎</Text>
              </View>
              <Text style={fontsLoaded ? styles.ctaText : styles.ctaTextFallback}>
                Ready to take control of what you eat?
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <LinearGradient
                  colors={['#FF6B35', '#F7931E', '#FFD700']}
                  style={styles.gradientButton}
                >
                  <Text style={fontsLoaded ? styles.buttonText : styles.buttonTextFallback}>🔥 Start Slaying Labels 🔥</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  wiseMascot: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  mascotEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleFallback: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#00FF00',
  },
  taglineFallback: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00FF00',
  },
  missionSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  missionText: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    lineHeight: 24,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  missionTextFallback: {
    fontSize: 16,
    lineHeight: 24,
    color: '#CCCCCC',
    marginBottom: 16,
    fontWeight: '500',
  },
  attitudeBox: {
    backgroundColor: 'rgba(0,255,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.3)',
    borderRadius: 12,
    padding: 16,
  },
  attitudeText: {
    fontSize: 14,
    color: '#00FF00',
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    lineHeight: 20,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  featureDescriptionFallback: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  featureAttitude: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  brandSection: {
    marginBottom: 40,
  },
  brandText: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 24,
    color: '#CCCCCC',
  },
  brandTextFallback: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  brandValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  valueItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valueEmoji: {
    fontSize: 24,
  },
  valueText: {
    fontSize: 14,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  valueSubtext: {
    fontSize: 10,
    color: '#00FF00',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  finalMascot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginBottom: 16,
  },
  finalMascotEmoji: {
    fontSize: 30,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
    color: '#CCCCCC',
  },
  ctaTextFallback: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#CCCCCC',
    fontWeight: '600',
  },
  ctaAttitude: {
    fontSize: 14,
    color: '#00FF00',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  ctaButton: {
    alignItems: 'center',
  },
  gradientButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextFallback: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
