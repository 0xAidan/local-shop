import React from 'react';
import { View, StyleSheet, Platform, SafeAreaView, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
  useSafeArea?: boolean;
  showBottomPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  style, 
  useSafeArea = true,
  showBottomPadding = true
}) => {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container style={[
      styles.container, 
      showBottomPadding && styles.bottomPadding,
      style
    ]}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  bottomPadding: {
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Account for bottom navigation
  },
}); 