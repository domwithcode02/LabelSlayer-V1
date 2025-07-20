import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HistoryService, HistoryItem } from '../../services/history';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await HistoryService.getHistory();
      setHistoryItems(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.deleteHistoryItem(id);
            loadHistory();
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all analysis history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.clearHistory();
            setHistoryItems([]);
          },
        },
      ]
    );
  };

  const navigateToDetails = (item: HistoryItem) => {
    router.push({
      pathname: '/scan-results',
      params: { 
        photoUri: item.photoUri || '',
        // Pass the analysis data as JSON string to avoid URL length limits
        analysisData: JSON.stringify({
          productName: item.productName,
          score: item.score,
          ingredients: item.ingredients,
          summary: item.summary,
          roastComment: item.roastComment,
        })
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Poor';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ThemedView style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text style={[fontsLoaded ? styles.loadingText : styles.loadingTextFallback, { color: isDark ? '#fff' : '#000' }]}>
              Loading history...
            </Text>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text style={[fontsLoaded ? styles.title : styles.titleFallback, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Label History
          </Text>
          <Text style={[fontsLoaded ? styles.subtitle : styles.subtitleFallback, { color: isDark ? '#ccc' : '#666' }]}>
            Your slayed labels ({historyItems.length})
          </Text>
          {historyItems.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { fontFamily: fontsLoaded ? 'ShipporiMincho' : undefined }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {historyItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[fontsLoaded ? styles.emptyTitle : styles.emptyTitleFallback, { color: isDark ? '#fff' : '#333' }]}>
              No labels slayed yet
            </Text>
            <Text style={[fontsLoaded ? styles.emptySubtitle : styles.emptySubtitleFallback, { color: isDark ? '#999' : '#666' }]}>
              Start analyzing labels to see your history here
            </Text>
            <TouchableOpacity 
              style={styles.startScanningButton}
              onPress={() => router.push('/(tabs)')}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.startScanningGradient}
              >
                <Text style={[styles.startScanningText, { fontFamily: fontsLoaded ? 'ShipporiMincho' : undefined }]}>Start Scanning</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.historyList} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {historyItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyItem, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                onPress={() => navigateToDetails(item)}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>
                      {HistoryService.getProductEmoji(item.productName)}
                    </Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[fontsLoaded ? styles.itemName : styles.itemNameFallback, { color: isDark ? '#fff' : '#333' }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={[fontsLoaded ? styles.itemDate : styles.itemDateFallback, { color: isDark ? '#999' : '#666' }]}>
                      {HistoryService.formatRelativeTime(item.timestamp)}
                    </Text>
                    <Text style={[fontsLoaded ? styles.itemSummary : styles.itemSummaryFallback, { color: isDark ? '#ccc' : '#777' }]} numberOfLines={2}>
                      {item.summary}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <View style={[
                    styles.scoreContainer,
                    { backgroundColor: getScoreColor(item.score) }
                  ]}>
                    <Text style={styles.scoreText}>{item.score}</Text>
                  </View>
                  <Text style={[fontsLoaded ? styles.scoreLabel : styles.scoreLabelFallback, { color: getScoreColor(item.score) }]}>
                    {getScoreLabel(item.score)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: 'CinzelDecorative',
  },
  titleFallback: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: 'ShipporiMincho',
  },
  subtitleFallback: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'ShipporiMincho',
  },
  itemNameFallback: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'ShipporiMincho',
  },
  itemDateFallback: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 16,
    fontFamily: 'ShipporiMincho',
  },
  itemSummaryFallback: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  itemRight: {
    alignItems: 'center',
    minWidth: 60,
  },
  scoreContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  scoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'ShipporiMincho',
  },
  scoreLabelFallback: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'CinzelDecorative',
  },
  emptyTitleFallback: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'ShipporiMincho',
  },
  emptySubtitleFallback: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  startScanningButton: {
    alignItems: 'center',
  },
  startScanningGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startScanningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'ShipporiMincho',
  },
  loadingTextFallback: {
    fontSize: 18,
    fontWeight: '600',
  },
});