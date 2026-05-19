import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading',
  size = 'large',
  color = colors.primary,
  fullScreen = false,
}) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.inline}>{content}</View>;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
});
