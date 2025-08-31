import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scale, spacing } from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

interface FloatingActionBarProps {
  scrollY: Animated.Value;
  onSearchPress: () => void;
  onFilterPress: () => void;
  onLocationPress: () => void;
  onProfilePress: () => void;
  activeFiltersCount: number;
}

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  scrollY,
  onSearchPress,
  onFilterPress,
  onLocationPress,
  onProfilePress,
  activeFiltersCount,
}) => {
  // Show the floating bar when header is collapsed
  const floatingBarOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.8, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const floatingBarTranslateY = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.8, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: floatingBarOpacity,
          transform: [{ translateY: floatingBarTranslateY }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        {/* Location Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLocationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Filter Button with Badge */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={20} color="#FFFFFF" />
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Animated.Text style={styles.badgeText}>
                {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
              </Animated.Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1001,
    height: 50,
  },
  background: {
    flex: 1,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(26, 26, 46, 0.95)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
}); 