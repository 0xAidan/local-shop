import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface HomeHeaderProps {
  user: User | null;
  userLocation: string;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
}

// City background images - you can add more cities here
const getCityImage = (cityName: string) => {
  // For now, we'll just use the fallback gradient
  // You can add city images later by creating an assets/cities folder
  return null;
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  userLocation,
  onProfilePress,
  onLocationPress,
}) => {
  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.fallbackGradient}
      />

      <View style={styles.content}>
        {/* City Name and Location */}
        <View style={styles.citySection}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={onLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={20} color="#FFFFFF" style={styles.locationIcon} />
            <Text style={styles.cityName}>{userLocation}</Text>
            <Ionicons name="chevron-down" size={16} color="#CCCCCC" style={styles.chevronIcon} />
          </TouchableOpacity>
          
          <Text style={styles.citySubtitle}>Discover local shops and artisans</Text>
        </View>

        {/* User Avatar */}
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
          
          {/* Notification indicator */}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    height: 160,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  citySection: {
    flex: 1,
    marginRight: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: screenWidth * 0.7,
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 0.5,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  citySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    marginLeft: 4,
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
});