
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LabelAnalysis, IngredientAnalysis } from '../services/openai';
import { analyzeWebProduct } from '../services/webAnalysis';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function WebAnalysisResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { productName, ingredients, brand } = useLocalSearchParams<{ 
    productName: string; 
    ingredients: string;
    brand: string;
  }>();

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  const [analysis, setAnalysis] = useState<LabelAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);

  useEffect(() => {
    if (productName && ingredients) {
      analyzeWebProductData();
    } else {
      setError('No product data provided for analysis');
      setLoading(false);
    }
  }, [productName, ingredients]);

  const analyzeWebProductData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeWebProduct(productName, ingredients, brand);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#22C55E';
      case 'moderate': return '#F59E0B';
      case 'bad': return '#EF4444';
      default: return '#666';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'moderate': return '⚠️';
      case 'bad': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.backgroundGradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <ThemedText type="title" style={[styles.loadingText, { color: '#fff' }]}>
              Analyzing {productName}...
            </ThemedText>
            <ThemedText style={[styles.loadingSubtext, { color: '#ccc' }]}>
              Breaking down ingredients with surgical precision
            </ThemedText>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.backgroundGradient}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: '#FF6B35' }]}>Analysis Failed</Text>
            <Text style={[styles.errorText, { color: '#ccc' }]}>
              {error || 'Unable to analyze this product.'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Try Another Product</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.backgroundGradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back to Search</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.productTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                {analysis.productName}
              </Text>
              {brand && (
                <Text style={[styles.brandText, { color: '#FF6B35' }]}>
                  {brand}
                </Text>
              )}
            </View>

            <View style={styles.scoreSection}>
              <LinearGradient
                colors={analysis.score > 70 ? ['#22C55E', '#16A34A'] : 
                       analysis.score > 40 ? ['#F59E0B', '#D97706'] : 
                       ['#EF4444', '#DC2626']}
                style={styles.scoreCard}
              >
                <Text style={styles.scoreLabel}>Health Score</Text>
                <Text style={styles.scoreValue}>{analysis.score}/100</Text>
                <Text style={styles.scoreDescription}>
                  {analysis.score > 70 ? 'Not terrible!' : 
                   analysis.score > 40 ? 'Proceed with caution' : 
                   'Big trash!'}
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.roastBox, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
              <Text style={[styles.roastTitle, { color: isDark ? '#FF6B35' : '#FF6B35' }]}>
                🔥 Roast Session:
              </Text>
              <Text style={[styles.roastText, { color: isDark ? '#ccc' : '#666' }]}>
                {analysis.roastComment}
              </Text>
            </View>

            <View style={styles.ingredientsSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                Ingredients Breakdown
              </Text>
              
              {analysis.ingredients.map((ingredient, index) => {
                const statusColor = getStatusColor(ingredient.status);
                const statusEmoji = getStatusEmoji(ingredient.status);
                const isExpanded = expandedIngredient === index;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.ingredientCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                    onPress={() => setExpandedIngredient(isExpanded ? null : index)}
                  >
                    <View style={styles.ingredientHeader}>
                      <View style={styles.ingredientNameContainer}>
                        <Text style={styles.statusEmoji}>{statusEmoji}</Text>
                        <View style={styles.ingredientInfo}>
                          <Text style={[styles.ingredientName, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                            {ingredient.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ingredientActions}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.statusText}>
                            {ingredient.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.expandIcon, { color: isDark ? '#ccc' : '#666' }]}>
                          {isExpanded ? '−' : '+'}
                        </Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={styles.ingredientExpanded}>
                        <Text style={[styles.ingredientReason, { color: isDark ? '#ccc' : '#666' }]}>
                          {ingredient.reason}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Search Another Product</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  scoreDescription: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  roastBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  roastTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  roastText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  ingredientCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  ingredientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  ingredientExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  ingredientReason: {
    fontSize: 15,
    lineHeight: 24,
    paddingRight: 8,
  },
  scanAgainButton: {
    marginTop: 20,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
