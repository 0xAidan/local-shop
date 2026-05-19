import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

/** Dev-only floating control — kept off the header so it does not overlap profile UI. */
export const RoleSwitcher: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentViewMode, switchViewMode } = useAuth();

  if (!__DEV__) {
    return null;
  }

  const handleSwitchRole = () => {
    const newMode = currentViewMode === 'customer' ? 'shop_owner' : 'customer';
    switchViewMode(newMode);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: insets.bottom + 100 }]}
      onPress={handleSwitchRole}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Switch dev role"
    >
      <View style={styles.content}>
        <Ionicons
          name={currentViewMode === 'customer' ? 'person' : 'business'}
          size={14}
          color={colors.textPrimary}
        />
        <Text style={styles.text}>
          {currentViewMode === 'customer' ? 'Customer' : 'Owner'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    zIndex: 50,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
