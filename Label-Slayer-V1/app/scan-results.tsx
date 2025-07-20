import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LabelAnalysis, IngredientAnalysis, analyzeLabelImage } from '../services/openai';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function ScanResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { imageUri, photoUri } = useLocalSearchParams<{ imageUri: string; photoUri?: string }>();

  const [analysis, setAnalysis] = useState<LabelAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  useEffect(() => {
    if (imageUri || photoUri) {
      analyzeLabel();
    } else {
      setError('No image provided for analysis');
      setLoading(false);
    }
  }, [imageUri, photoUri]);

  const analyzeLabel = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeLabelImage(imageUri || photoUri || '');
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze label');
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze the label. Please try again or check your internet connection.',
        [
          { text: 'Retry', onPress: analyzeLabel },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Terrible';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'bad': return '#f44336';
      default: return '#9E9E9E';
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

  const getIngredientCategoryInfo = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();

    if (name.includes('sugar') || name.includes('syrup') || name.includes('fructose') || name.includes('glucose') || name.includes('dextrose')) {
      return { category: 'Sweetener', icon: '🍯', concern: 'Blood Sugar Impact' };
    }
    if (name.includes('oil') || name.includes('fat') || name.includes('butter')) {
      return { category: 'Fat/Oil', icon: '🧈', concern: 'Fat Quality' };
    }
    if (name.includes('sodium') || name.includes('salt')) {
      return { category: 'Sodium', icon: '🧂', concern: 'Blood Pressure' };
    }
    if (name.includes('preservative') || name.includes('acid') || name.includes('benzoate') || name.includes('sulfite')) {
      return { category: 'Preservative', icon: '🧪', concern: 'Chemical Load' };
    }
    if (name.includes('color') || name.includes('dye') || name.includes('red') || name.includes('yellow') || name.includes('blue')) {
      return { category: 'Artificial Color', icon: '🎨', concern: 'Behavioral Effects' };
    }
    if (name.includes('flavor') || name.includes('essence')) {
      return { category: 'Flavoring', icon: '🌿', concern: 'Artificial vs Natural' };
    }
    if (name.includes('protein') || name.includes('isolate') || name.includes('concentrate')) {
      return { category: 'Protein', icon: '💪', concern: 'Protein Quality' };
    }
    if (name.includes('fiber') || name.includes('cellulose') || name.includes('gum')) {
      return { category: 'Fiber/Thickener', icon: '🌾', concern: 'Digestive Impact' };
    }
    if (name.includes('vitamin') || name.includes('mineral') || name.includes('iron') || name.includes('calcium')) {
      return { category: 'Nutrient', icon: '💊', concern: 'Bioavailability' };
    }

    return { category: 'Other', icon: '🔍', concern: 'Processing Level' };
  };

  const toggleIngredientExpansion = (index: number) => {
    setExpandedIngredient(expandedIngredient === index ? null : index);
  };

  // New functions for processing level and insights
  const getProcessingLevel = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();

    if (name.includes('hydrogenated') || name.includes('modified') || name.includes('isolate') || name.includes('hydrolyzed')) {
      return 'HIGH';
    }
    if (name.includes('concentrate') || name.includes('extract') || name.includes('powder')) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  const getProcessingLevelColor = (ingredientName: string) => {
    const level = getProcessingLevel(ingredientName);
    switch (level) {
      case 'HIGH': return '#EF4444';
      case 'MEDIUM': return '#F59E0B';
      default: return '#22C55E';
    }
  };

  const getNutritionalInsight = (ingredients: IngredientAnalysis[]) => {
    let insight = "Honestly, I've seen worse. But that's not saying much.";
    const badIngredients = ingredients.filter(i => i.status === 'bad');
    const sugars = ingredients.filter(i => i.name.toLowerCase().includes('sugar') || i.name.toLowerCase().includes('syrup'));
    const oils = ingredients.filter(i => i.name.toLowerCase().includes('oil'));
    const sodium = ingredients.filter(i => i.name.toLowerCase().includes('sodium') || i.name.toLowerCase().includes('salt'));
    const preservatives = ingredients.filter(i => i.name.toLowerCase().includes('preservative'));
    const colors = ingredients.filter(i => i.name.toLowerCase().includes('color') || i.name.toLowerCase().includes('dye'));

    if (badIngredients.length > ingredients.length / 2) {
      insight = "This product is heavily processed and contains a significant number of ingredients flagged as 'bad'. It's recommended to seek healthier alternatives.";
    } else if (sugars.length > 2) {
      insight = "This product contains a high amount of sugar. Consuming it regularly may lead to blood sugar spikes and other health issues.";
    } else if (oils.length > 1) {
      insight = "This product contains multiple sources of oils. Consider the quality and source of these oils for your health.";
    } else if (sodium.length > 1) {
      insight = "This product contains a high amount of sodium. Consuming it regularly may lead to blood pressure spikes and other health issues.";
    } else if (preservatives.length > 1) {
      insight = "This product contains multiple preservatives. Limit your intake of products with high levels of preservatives.";
    } else if (colors.length > 1) {
      insight = "This product contains artificial colors. Limit your intake of products with artificial colors.";
    } else {
      insight = "This product has a relatively balanced ingredient profile. However, it is still recommended to consume it in moderation as part of a balanced diet."
    }

    return insight;
  };

  const getMacroProfileInsight = (ingredients: IngredientAnalysis[]) => {
    const badIngredients = ingredients.filter(i => i.status === 'bad');
    const sugars = ingredients.filter(i => i.name.toLowerCase().includes('sugar') || i.name.toLowerCase().includes('syrup'));
    const oils = ingredients.filter(i => i.name.toLowerCase().includes('oil'));

    if (badIngredients.length > ingredients.length / 2) {
      return "Listen up! This macro profile is a hot mess. You've got more processed junk than a gas station convenience store. This ain't food, it's a chemistry experiment gone wrong. Your body deserves better than this industrial waste.";
    } else if (sugars.length > 2) {
      return "Sugar city over here! This thing's got more sweeteners than a candy factory. Your blood sugar's about to ride a roller coaster that would make Six Flags jealous. Not exactly what I'd call balanced nutrition.";
    } else if (oils.length > 1) {
      return "Oil spill alert! These industrial oils are about as healthy as drinking motor oil. Your arteries are gonna stage a protest if you keep this up. Where are the real fats? Where's the grass-fed goodness?";
    } else {
      return "Not terrible, but we're still playing in processed food territory. This macro profile screams 'I was made in a factory, not a kitchen.' Could be worse, could definitely be better.";
    }
  };

  const getBioavailabilityInsight = (ingredients: IngredientAnalysis[]) => {
    const processed = ingredients.filter(i => 
      i.name.toLowerCase().includes('isolate') || 
      i.name.toLowerCase().includes('concentrate') || 
      i.name.toLowerCase().includes('modified')
    );
    const synthetic = ingredients.filter(i => 
      i.name.toLowerCase().includes('vitamin') && i.status === 'bad'
    );

    if (processed.length > 2) {
      return "Bioavailability? More like bio-unavailability! These processed proteins and isolates are about as useful to your body as a screen door on a submarine. Your body doesn't know what to do with this lab-created nonsense.";
    } else if (synthetic.length > 0) {
      return "Synthetic vitamins? Please! Your body can't tell the difference between real nutrients and these chemical copycats... except it totally can, and it's not impressed. This stuff has the bioavailability of cardboard.";
    } else {
      return "The nutrient absorption here is questionable at best. Processing destroys most of the good stuff, leaving you with expensive pee and disappointed cells. Your ancestors would be confused by this 'food.'";
    }
  };

  const getBloodSugarInsight = (ingredients: IngredientAnalysis[]) => {
    const sugars = ingredients.filter(i => 
      i.name.toLowerCase().includes('sugar') || 
      i.name.toLowerCase().includes('syrup') || 
      i.name.toLowerCase().includes('fructose') ||
      i.name.toLowerCase().includes('dextrose')
    );
    const refined = ingredients.filter(i => 
      i.name.toLowerCase().includes('flour') || 
      i.name.toLowerCase().includes('starch')
    );

    if (sugars.length > 2) {
      return "Blood sugar impact? Think rocket ship to Mars! This sugar bomb is gonna send your glucose levels on a wild ride that ends in a crash landing. Your pancreas is about to file a complaint with HR.";
    } else if (refined.length > 1) {
      return "These refined carbs hit your bloodstream faster than bad news travels. One minute you're flying high, next minute you're face-first in the couch wondering why you feel like garbage. Classic processed food betrayal.";
    } else if (sugars.length > 0) {
      return "Moderate sugar rush incoming! Not the worst I've seen, but your blood sugar's still gonna do a little cha-cha. At least it's not a full-blown metabolic meltdown, I guess.";
    } else {
      return "Blood sugar impact seems relatively stable here. No major sugar bombs detected, though that doesn't mean this is health food. Just means you won't crash as hard as usual.";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <ThemedText type="title" style={[styles.loadingText, { color: '#fff' }]}>
            Analyzing your label...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={[styles.errorTitle, { color: '#FF6B35' }]}>Analysis Failed</ThemedText>
          <ThemedText style={[styles.errorText, { color: '#ccc' }]}>
            {error || 'Unable to analyze label'}
          </ThemedText>
          <TouchableOpacity onPress={analyzeLabel} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: '#FF6B35' }]}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={[styles.backText, { color: '#FF6B35' }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              Label Slayed!
            </Text>
          </View>

          <View style={styles.productSection}>
            <View style={styles.productImageContainer}>
              {photoUri || imageUri ? (
                <Image source={{ uri: photoUri || imageUri }} style={styles.capturedImage} />
              ) : (
                <View style={[styles.productImage, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                  <Text style={styles.productImageText}>📦</Text>
                </View>
              )}
              <Text style={[styles.productName, { color: isDark ? '#fff' : '#000' }]}>
                {analysis.productName}
              </Text>
            </View>
          </View>

          <View style={styles.scoreSection}>
            <LinearGradient
              colors={[getScoreColor(analysis.score), getScoreColor(analysis.score) + '80']}
              style={styles.scoreContainer}
            >
              <Text style={styles.scoreNumber}>{analysis.score}</Text>
              <Text style={styles.scoreLabel}>{getScoreLabel(analysis.score)}</Text>
            </LinearGradient>

            <View style={styles.scoreBreakdown}>
              <Text style={[styles.scoreBreakdownTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                Health Score Breakdown
              </Text>
            </View>

            <Text style={[styles.scoreSummary, { color: isDark ? '#ccc' : '#666' }]}>
              {analysis.summary}
            </Text>

            <View style={[styles.roastBox, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
              <Text style={[styles.roastTitle, { color: isDark ? '#FF6B35' : '#FF6B35' }]}>
                🔥 Roast Session:
              </Text>
              <Text style={[styles.roastText, { color: isDark ? '#ccc' : '#666' }]}>
                {analysis.roastComment}
              </Text>
            </View>
          </View>

          <View style={styles.ingredientsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              Ingredient Analysis
            </Text>

            <View style={styles.ingredientsSummary}>
              <View style={[styles.summaryCard, { backgroundColor: '#22C55E' }]}>
                <Text style={styles.summaryNumber}>
                  {analysis.ingredients.filter(i => i.status === 'good').length}
                </Text>
                <Text style={styles.summaryLabel}>Good</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.summaryNumber}>
                  {analysis.ingredients.filter(i => i.status === 'moderate').length}
                </Text>
                <Text style={styles.summaryLabel}>Moderate</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.summaryNumber}>
                  {analysis.ingredients.filter(i => i.status === 'bad').length}
                </Text>
                <Text style={styles.summaryLabel}>Bad</Text>
              </View>
            </View>

            {analysis.ingredients.map((ingredient, index) => {
              const statusColor = getStatusColor(ingredient.status);
              const statusEmoji = getStatusEmoji(ingredient.status);
              const isExpanded = expandedIngredient === index;
              const categoryInfo = getIngredientCategoryInfo(ingredient.name);

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.ingredientCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                  onPress={() => toggleIngredientExpansion(index)}
                >
                  <View style={styles.ingredientHeader}>
                    <View style={styles.ingredientNameContainer}>
                      <ThemedText style={styles.statusEmoji}>{statusEmoji}</ThemedText>
                      <View style={styles.ingredientInfo}>
                        <ThemedText type="defaultSemiBold" style={[styles.ingredientName, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                          {ingredient.name}
                        </ThemedText>
                        <View style={styles.categoryContainer}>
                          <ThemedText style={styles.categoryIcon}>{categoryInfo.icon}</ThemedText>
                          <ThemedText style={[styles.categoryText, { color: isDark ? '#ccc' : '#888' }]}>
                            {categoryInfo.category}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <View style={styles.ingredientActionsContainer}>
                      <View style={styles.ingredientActions}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <ThemedText style={styles.statusText}>
                            {ingredient.status.toUpperCase()}
                          </ThemedText>
                        </View>
                        <ThemedText style={[styles.expandIcon, { color: isDark ? '#ccc' : '#666' }]}>
                          {isExpanded ? '−' : '+'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.ingredientExpanded}>
                      <ThemedText style={[styles.ingredientReason, { color: isDark ? '#ccc' : '#666' }]}>
                        {ingredient.reason}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.nutritionInsights}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              Nutritional Insights
            </Text>
            <View style={[styles.aiInsightCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
              <Text style={[styles.aiInsightText, { color: isDark ? '#ccc' : '#666' }]}>
                {getNutritionalInsight(analysis.ingredients)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Slay Another Label</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  productSection: {
    marginBottom: 32,
  },
  productImageContainer: {
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageText: {
    fontSize: 48,
    marginBottom: 8,
  },
  capturedImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  scoreBreakdown: {
    width: '100%',
    marginBottom: 20,
  },
  scoreBreakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreMetrics: {
    gap: 12,
  },
  metric: {
    padding: 16,
    borderRadius: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreSummary: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 20,
  },
  roastBox: {
    padding: 16,
    borderRadius: 12,
    maxWidth: 320,
  },
  roastTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  roastText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  ingredientsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  ingredientsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  aiInsightCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 24,
  },
  aiInsightText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingredientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  concernBadge: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  concernLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  ingredientDescription: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingredientReason: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    paddingRight: 8,
  },
  healthMetrics: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  metricName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  riskIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  riskText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  nutritionInsights: {
    marginBottom: 32,
  },
  scanAgainButton: {
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
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientActionsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});