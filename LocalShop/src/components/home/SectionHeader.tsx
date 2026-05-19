import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout } from '../../theme/colors';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} style={styles.action} hitSlop={8}>
        <Text style={styles.actionText}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});
