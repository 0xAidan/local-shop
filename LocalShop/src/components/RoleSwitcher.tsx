import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, layout } from '../theme/colors';

export const RoleSwitcher: React.FC = () => {
  const { currentViewMode, switchViewMode } = useAuth();

  if (!__DEV__) {
    return null;
  }

  const nextMode = currentViewMode === 'customer' ? 'shop_owner' : 'customer';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Developer</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={() => switchViewMode(nextMode)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={currentViewMode === 'customer' ? 'person-outline' : 'business-outline'}
          size={18}
          color={colors.textSecondary}
        />
        <Text style={styles.value}>
          Viewing as {currentViewMode === 'customer' ? 'customer' : 'shop owner'}
        </Text>
        <Text style={styles.switch}>Switch</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: layout.sectionGap,
    paddingHorizontal: layout.screenPadding,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  switch: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
