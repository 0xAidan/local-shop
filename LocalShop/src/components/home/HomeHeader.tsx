import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar, SearchFilters } from '../SearchBar';
import { User } from '../../types';
import { colors, layout } from '../../theme/colors';

interface HomeHeaderProps {
  user: User | null;
  userLocation: string;
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  onProfilePress: () => void;
  onLocationPress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  userLocation,
  onSearch,
  onFilterChange,
  onProfilePress,
  onLocationPress,
}) => {
  const insets = useSafeAreaInsets();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?';

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.location}
          onPress={onLocationPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Location ${userLocation}`}
        >
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {userLocation}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatar}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Discover</Text>

      <SearchBar
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        placeholder="Search shops"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: 14,
  },
});
