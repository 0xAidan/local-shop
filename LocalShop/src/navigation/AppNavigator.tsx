import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  ShopDetail: { shop: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 