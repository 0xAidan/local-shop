import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface HomeHeaderProps {
  user: User | null;
  userLocation: string;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
}

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Left side - Greeting and Location */}
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.firstName || 'there'}!
          </Text>
          
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={onLocationPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>📍</Text>
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {userLocation}
            </Text>
            <Text style={styles.locationChevron}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Right side - User Avatar */}
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: screenWidth * 0.6,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationIconText: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  locationChevron: {
    fontSize: 10,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 16,
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