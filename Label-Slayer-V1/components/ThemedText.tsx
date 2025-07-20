import { StyleSheet, Text, type TextProps } from 'react-native';
import { useFonts, CinzelDecorative_400Regular } from '@expo-google-fonts/cinzel-decorative';
import { ShipporiMincho_400Regular } from '@expo-google-fonts/shippori-mincho';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  const [fontsLoaded] = useFonts({
    'CinzelDecorative': CinzelDecorative_400Regular,
    'ShipporiMincho': ShipporiMincho_400Regular,
  });

  return (
    <Text
      style={[
        { color },
        type === 'default' ? (fontsLoaded ? styles.default : styles.defaultFallback) : undefined,
        type === 'title' ? (fontsLoaded ? styles.title : styles.titleFallback) : undefined,
        type === 'defaultSemiBold' ? (fontsLoaded ? styles.defaultSemiBold : styles.defaultSemiBoldFallback) : undefined,
        type === 'subtitle' ? (fontsLoaded ? styles.subtitle : styles.subtitleFallback) : undefined,
        type === 'link' ? (fontsLoaded ? styles.link : styles.linkFallback) : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    lineHeight: 24,
  },
  defaultFallback: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    lineHeight: 24,
  },
  defaultSemiBoldFallback: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
    lineHeight: 32,
  },
  titleFallback: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative',
    fontWeight: '400',
  },
  subtitleFallback: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'ShipporiMincho',
    fontWeight: '400',
    color: '#0a7ea4',
  },
  linkFallback: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
  },
});
