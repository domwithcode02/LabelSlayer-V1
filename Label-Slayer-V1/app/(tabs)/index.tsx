import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = true; // Always dark mode as per design spec

  // Animation refs
  const cardSlide = useRef(new Animated.Value(50)).current;
  const buttonBounce = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  useEffect(() => {
    // Card slide in
    Animated.timing(cardSlide, {
      toValue: 0,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSlayLabel = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonBounce, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonBounce, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonBounce, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => router.push('/camera'), 200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
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
            </View>

            <Text style={fontsLoaded ? styles.title : styles.titleFallback}>
              Label Slayer
            </Text>
            <Text style={fontsLoaded ? styles.subtitle : styles.subtitleFallback}>
              Let's see what kind of BS they're trying to sneak into your food
            </Text>
          </View>

          <Animated.View 
            style={[
              styles.heroSection,
              { transform: [{ translateY: cardSlide }] }
            ]}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E', '#FFD700']}
              style={styles.analyticsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.scanIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                    style={styles.scanIcon}
                  >
                    <Text style={styles.scanIconText}>⚡</Text>
                  </LinearGradient>
                </View>
                <Text style={fontsLoaded ? styles.cardTitle : styles.cardTitleFallback}>Instant Analysis</Text>
                <Text style={fontsLoaded ? styles.cardDescription : styles.cardDescriptionFallback}>
                  AI so smart, it'll call out your food like it owes you money.
                </Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statNumber}>99%</Text>
                    </View>
                    <Text style={fontsLoaded ? styles.statLabel : styles.statLabelFallback}>Accuracy</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statNumber}>10s</Text>
                    </View>
                    <Text style={fontsLoaded ? styles.statLabel : styles.statLabelFallback}>Faster than your ex ghosting you</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <Animated.View style={{ transform: [{ scale: buttonBounce }] }}>
              <TouchableOpacity style={styles.slayButton} onPress={handleSlayLabel}>
                <LinearGradient
                  colors={['#FF6B35', '#F7931E', '#FFD700']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.buttonContent}>
                    <Text style={fontsLoaded ? styles.buttonText : styles.buttonTextFallback}>BUST THAT LABEL</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={[styles.orText, { color: '#666' }]}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={() => router.push('/product-search')}
            >
              <LinearGradient
                colors={['rgba(255,107,53,0.2)', 'rgba(247,147,30,0.2)']}
                style={styles.searchGradientButton}
              >
                <View style={styles.searchButtonContent}>
                  <Text style={styles.searchIcon}>🌐</Text>
                  <Text style={fontsLoaded ? styles.searchButtonText : styles.searchButtonTextFallback}>
                    Search Web Products
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.instructionContainer}>
              <Text style={fontsLoaded ? styles.description : styles.descriptionFallback}>
                Snap a pic. I'll break it down. No sugar-coating (unless it's in the damn ingredients).
              </Text>
            </View>
          </Animated.View>
        </ThemedView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 48,
    height: 48,
  },

  title: {
    fontSize: 28,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1.5,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  titleFallback: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1.5,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#00FF00',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  subtitleFallback: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF00',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  analyticsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    alignItems: 'center',
  },
  scanIconContainer: {
    marginBottom: 8,
  },
  scanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanIconText: {
    fontSize: 24,
    color: 'white',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardTitleFallback: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  cardDescriptionFallback: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 100,
  },
  statLabelFallback: {
    fontSize: 10,
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 100,
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 16,
  },
  slayButton: {
    marginBottom: 12,
    width: '100%',
  },
  gradientButton: {
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    marginRight: 10,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextFallback: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonIconText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 0,
  },
  description: {
    fontSize: 12,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  descriptionFallback: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 16,
    color: '#CCCCCC',
    fontWeight: '500',
    marginBottom: 8,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#666',
  },
  searchButton: {
    width: '100%',
    marginBottom: 12,
  },
  searchGradientButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
  },
  searchButtonTextFallback: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
  },

});