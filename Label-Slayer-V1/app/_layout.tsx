import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingScreen from '@/components/LoadingScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showLoading, setShowLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  // Show loading screen for minimum time
  useEffect(() => {
    // Always show loading screen for at least 2 seconds
    const minTimer = setTimeout(() => {
      if (fontsLoaded) {
        setShowLoading(false);
      }
    }, 2000);

    // If fonts take longer than 2 seconds, hide when they're ready
    if (fontsLoaded) {
      const fontTimer = setTimeout(() => {
        setShowLoading(false);
      }, 100);
      return () => {
        clearTimeout(minTimer);
        clearTimeout(fontTimer);
      };
    }

    return () => clearTimeout(minTimer);
  }, [fontsLoaded]);

  if (showLoading) {
    return <LoadingScreen onFinish={() => setShowLoading(false)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="scan-results" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
