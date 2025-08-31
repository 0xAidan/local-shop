import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { fontSize, buttonSizes, scale } from '../utils/responsive';

interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const buttonSize = getButtonSize();
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(8),
      paddingHorizontal: buttonSize.paddingHorizontal,
      paddingVertical: buttonSize.paddingVertical,
      minHeight: buttonSize.height,
      opacity: disabled ? 0.6 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#667eea',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#1a1a1a',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#667eea',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: getFontSize(),
      fontWeight: '600',
      textAlign: 'center',
      flexShrink: 1, // Allow text to shrink
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          color: '#667eea',
        };
      default:
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
    }
  };

  const getButtonSize = () => {
    return buttonSizes[size];
  };

  const getFontSize = (): number => {
    return getButtonSize().fontSize;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <>{icon}</>}
      <Text 
        style={[getTextStyle(), textStyle]} 
        numberOfLines={1} 
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}; 