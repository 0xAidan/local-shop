import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout } from '../theme/colors';

interface EmptyStateProps {
  title: string;
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  iconName = 'search-outline',
  actionText,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Ionicons name={iconName} size={32} color={colors.textMuted} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {actionText && onAction ? (
      <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{actionText}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});
