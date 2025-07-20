
/**
 * Leon-style bold color palette with dark theme and neon accents
 */

const tintColorLight = '#FF6B35';
const tintColorDark = '#FF6B35';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
  },
  // Leon-style palette
  neon: {
    orange: '#FF6B35',
    gold: '#FFD700',
    green: '#00FF00',
    red: '#FF0000',
    yellow: '#FFFF00',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#CCCCCC',
    darkGray: '#666666',
  },
  gradients: {
    primary: ['#FF6B35', '#F7931E', '#FFD700'],
    success: ['#00FF00', '#32CD32'],
    warning: ['#FFD700', '#FFA500'],
    danger: ['#FF0000', '#FF6B35'],
  },
};
