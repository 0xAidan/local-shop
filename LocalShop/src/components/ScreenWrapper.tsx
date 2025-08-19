import React from 'react';
import { View, StyleSheet, Platform, SafeAreaView } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
  useSafeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  style, 
  useSafeArea = true 
}) => {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container style={[styles.container, style]}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Account for bottom navigation
  },
}); 