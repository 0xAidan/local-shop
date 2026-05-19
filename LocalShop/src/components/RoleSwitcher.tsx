import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// 🚨 DEVELOPMENT MODE: Role switcher for testing
// TODO: Remove this component when authentication is re-enabled

export const RoleSwitcher: React.FC = () => {
  if (!__DEV__) {
    return null;
  }

  const { currentViewMode, switchViewMode } = useAuth();

  const handleSwitchRole = () => {
    const newMode = currentViewMode === 'customer' ? 'shop_owner' : 'customer';
    switchViewMode(newMode);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleSwitchRole}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons 
          name={currentViewMode === 'customer' ? 'person' : 'business'} 
          size={16} 
          color="#FFFFFF" 
        />
        <Text style={styles.text}>
          {currentViewMode === 'customer' ? 'Customer' : 'Shop Owner'}
        </Text>
        <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 