
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

interface ProductSearchResult {
  product_name: string;
  brands?: string;
  ingredients_text?: string;
  image_url?: string;
  nutrition_grades?: string;
}

export default function ProductSearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = true;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Enter a product name', 'Please enter a product name to search');
      return;
    }

    setLoading(true);
    try {
      // Using OpenFoodFacts API for product search
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeProduct = async (product: ProductSearchResult) => {
    if (!product.ingredients_text) {
      Alert.alert('No Ingredients', 'This product does not have ingredient information available.');
      return;
    }

    // Create a mock image URI with the ingredients text
    const mockAnalysis = {
      productName: product.product_name,
      ingredients: product.ingredients_text,
      brand: product.brands || 'Unknown Brand'
    };

    // Navigate to analysis screen with product data
    router.push({
      pathname: '/web-analysis-results',
      params: mockAnalysis
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <Text style={fontsLoaded ? styles.title : styles.titleFallback}>
              Product Search
            </Text>
            <Text style={fontsLoaded ? styles.subtitle : styles.subtitleFallback}>
              Search the web for any product and get instant ingredient analysis
            </Text>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
                placeholder="Enter product name (e.g., 'Coca Cola', 'Oreos')"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchProducts}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchProducts}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.searchButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.searchButtonText}>🔍</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {searchResults.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.productCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                onPress={() => analyzeProduct(product)}
              >
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: isDark ? '#fff' : '#000' }]}>
                    {product.product_name}
                  </Text>
                  {product.brands && (
                    <Text style={[styles.productBrand, { color: isDark ? '#FF6B35' : '#FF6B35' }]}>
                      {product.brands}
                    </Text>
                  )}
                  <Text style={[styles.productIngredients, { color: isDark ? '#ccc' : '#666' }]}>
                    {product.ingredients_text 
                      ? `${product.ingredients_text.substring(0, 100)}...`
                      : 'No ingredients available'
                    }
                  </Text>
                </View>
                <View style={styles.analyzeButton}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.analyzeButtonGradient}
                  >
                    <Text style={styles.analyzeButtonText}>Analyze</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}

            {!loading && searchResults.length === 0 && searchQuery && (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsTitle, { color: isDark ? '#fff' : '#000' }]}>
                  No Products Found
                </Text>
                <Text style={[styles.noResultsText, { color: isDark ? '#ccc' : '#666' }]}>
                  Try searching with different keywords or check your spelling
                </Text>
              </View>
            )}
          </ScrollView>
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
    marginBottom: 24,
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
  title: {
    fontSize: 28,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleFallback: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#00FF00',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },
  subtitleFallback: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF00',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  searchButton: {
    width: 48,
    height: 48,
  },
  searchButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  productIngredients: {
    fontSize: 12,
    lineHeight: 16,
  },
  analyzeButton: {
    justifyContent: 'center',
  },
  analyzeButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
});
