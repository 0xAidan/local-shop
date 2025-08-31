import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar, SearchFilters } from './SearchBar';
import { CategoryFilter, Category } from './CategoryFilter';
import { User } from '../types';
import { RoleSwitcher } from './RoleSwitcher';
import { scale, fontSize, spacing } from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DynamicHeaderProps {
  user: User | null;
  userLocation: string;
  searchQuery: string;
  selectedCategory: string | null;
  activeFilters: SearchFilters;
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onFilterChange: (filters: SearchFilters) => void;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
  scrollY: Animated.Value;
}

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 160; // Keep main header elements visible
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  user,
  userLocation,
  searchQuery,
  selectedCategory,
  activeFilters,
  onSearch,
  onCategorySelect,
  onFilterChange,
  onProfilePress,
  onLocationPress,
  scrollY,
}) => {
  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Animated values for search and category sections only
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.4],
    extrapolate: 'clamp',
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const categoryFilterOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9, 0.7],
    extrapolate: 'clamp',
  });

  const categoryFilterTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        {/* Static Header Elements */}
        <View style={styles.staticHeader}>
          {/* Top Row - Location and Avatar */}
          <View style={styles.topRow}>
            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" style={styles.locationIcon} />
              <Text style={styles.cityName}>{userLocation}</Text>
              <Ionicons name="chevron-down" size={16} color="#CCCCCC" style={styles.chevronIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={onProfilePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {getUserInitials()}
                </Text>
              </LinearGradient>
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Title Section - Always Visible */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Discover Local Shops</Text>
            <Text style={styles.subtitle}>
              Find amazing products from artisans in your area
            </Text>
          </View>
        </View>

        {/* Dynamic Search Bar */}
        <Animated.View 
          style={[
            styles.searchSection, 
            { 
              opacity: searchBarOpacity,
              transform: [{ translateY: searchBarTranslateY }]
            }
          ]}
        >
          <SearchBar
            onSearch={onSearch}
            onFilterChange={onFilterChange}
            placeholder="Search shops..."
          />
        </Animated.View>

        {/* Dynamic Category Filter */}
        <Animated.View 
          style={[
            styles.categorySection, 
            { 
              opacity: categoryFilterOpacity,
              transform: [{ translateY: categoryFilterTranslateY }]
            }
          ]}
        >
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        </Animated.View>

        {/* Role Switcher - Development Mode */}
        <View style={styles.roleSwitcherContainer}>
          <RoleSwitcher />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEADER_MAX_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#1a1a2e',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 20,
    paddingHorizontal: spacing.lg,
  },
  staticHeader: {
    marginBottom: spacing.lg,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: screenWidth * 0.6,
  },
  locationIcon: {
    marginRight: 8,
  },
  cityName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 0.5,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4757',
    borderWidth: 2,
    borderColor: '#000000',
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  searchSection: {
    marginBottom: spacing.base,
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  roleSwitcherContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 20,
    right: spacing.lg,
  },
}); 