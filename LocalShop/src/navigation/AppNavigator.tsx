import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { apiService } from '../services/api';
import { User } from '../types';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ShopOwnerDashboard } from '../screens/ShopOwnerDashboard';
import { CreateShopScreen } from '../screens/CreateShopScreen';
import { CreateProductScreen } from '../screens/CreateProductScreen';

// Placeholder screens (to be created)
const MyShopsScreen = () => null;
const ProfileScreen = () => null;
const CustomerDashboard = () => null;

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ShopDetail: { shop: any };
  ShopOwnerDashboard: undefined;
  CreateShop: undefined;
  CreateProduct: undefined;
  MyShops: undefined;
  Profile: undefined;
  CustomerDashboard: undefined;
  ShopOwnerTabs: undefined;
  CustomerTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={CustomerDashboard}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>❤️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Shop Owner Tab Navigator
const ShopOwnerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ShopOwnerDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyShops"
        component={MyShopsScreen}
        options={{
          tabBarLabel: 'My Shops',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={CreateProductScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
        }}
      >
        {!isAuthenticated ? (
          // Authentication screens
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.role === 'shop_owner' ? (
          // Shop Owner Flow
          <>
            <Stack.Screen name="ShopOwnerTabs" component={ShopOwnerTabNavigator} />
            <Stack.Screen name="CreateShop" component={CreateShopScreen} />
            <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
            <Stack.Screen name="MyShops" component={MyShopsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
          </>
        ) : (
          // Customer Flow
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 