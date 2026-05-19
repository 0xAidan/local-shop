import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar, SearchFilters } from './SearchBar';
import { User } from '../types';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../utils/responsive';

export const HOME_HEADER_HEIGHT = 248;

interface DynamicHeaderProps {
  user: User | null;
  userLocation: string;
  searchQuery: string;
  activeFilters: SearchFilters;
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
  scrollY: Animated.Value;
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  user,
  userLocation,
  onSearch,
  onFilterChange,
  onProfilePress,
  onLocationPress,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = HOME_HEADER_HEIGHT + insets.top;

  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80, 140],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -48],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { height: headerHeight, transform: [{ translateY: headerTranslateY }] },
      ]}
    >
      <LinearGradient colors={[...colors.headerGradient]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={onLocationPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Location: ${userLocation}`}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.cityName} numberOfLines={1}>
              {userLocation}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.titleSection, { opacity: titleOpacity }]}>
          <Text style={styles.title}>Discover Local Shops</Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Find amazing products from artisans near you
          </Animated.Text>
        </Animated.View>

        <View style={styles.searchSection}>
          <SearchBar
            onSearch={onSearch}
            onFilterChange={onFilterChange}
            placeholder="Search shops..."
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '72%',
  },
  cityName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  avatarButton: {
    marginLeft: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleSection: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: fontSize.base * 1.4,
  },
  searchSection: {
    marginTop: spacing.xs,
  },
});
