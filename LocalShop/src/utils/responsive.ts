import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for iPhone 12 Pro (390x844) - our design reference
const baseWidth = 390;
const baseHeight = 844;

// Responsive scaling functions
export const scale = (size: number): number => {
  return (screenWidth / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  return (screenHeight / baseHeight) * size;
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Font sizes
export const fontSize = {
  xs: Math.min(screenWidth * 0.025, 10),
  sm: Math.min(screenWidth * 0.03, 12),
  base: Math.min(screenWidth * 0.035, 14),
  lg: Math.min(screenWidth * 0.04, 16),
  xl: Math.min(screenWidth * 0.045, 18),
  '2xl': Math.min(screenWidth * 0.05, 20),
  '3xl': Math.min(screenWidth * 0.06, 24),
  '4xl': Math.min(screenWidth * 0.07, 28),
};

// Spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  base: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(32),
  '4xl': scale(40),
};

// Button sizes
export const buttonSizes = {
  small: {
    height: scale(32),
    paddingHorizontal: Math.max(8, screenWidth * 0.02),
    paddingVertical: 6,
    fontSize: fontSize.sm,
  },
  medium: {
    height: scale(40),
    paddingHorizontal: Math.max(12, screenWidth * 0.03),
    paddingVertical: 10,
    fontSize: fontSize.base,
  },
  large: {
    height: scale(48),
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    paddingVertical: 14,
    fontSize: fontSize.lg,
  },
};

// Screen dimensions
export const screen = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < 375,
  isMedium: screenWidth >= 375 && screenWidth < 414,
  isLarge: screenWidth >= 414,
  isTablet: screenWidth >= 768,
};

// Platform-specific values
export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : 20,
  bottomPadding: Platform.OS === 'ios' ? 90 : 70,
};

// Common responsive styles
export const responsiveStyles = {
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.4,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold' as const,
    lineHeight: fontSize['2xl'] * 1.2,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.3,
  },
  button: {
    borderRadius: scale(8),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
}; 