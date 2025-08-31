import React from 'react';
import { Platform, Dimensions, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ShopOwnerDashboard } from '../screens/ShopOwnerDashboard';
import { CreateShopScreen } from '../screens/CreateShopScreen';
import { CreateProductScreen } from '../screens/CreateProductScreen';
import { MyShopsScreen } from '../screens/MyShopsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomerDashboard } from '../screens/CustomerDashboard';
import { MapScreen } from '../screens/MapScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderManagementScreen } from '../screens/OrderManagementScreen';

const { width: screenWidth } = Dimensions.get('window');

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
  MapScreen: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderManagement: { shop: any };
  ShopOwnerTabs: undefined;
  CustomerTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  const { totalItems } = useCart();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 90 : 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'map' : 'map-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={focused ? 'bag' : 'bag-outline'} 
                size={24} 
                color={color} 
              />
              {totalItems > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: '#FF4757',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#1a1a1a',
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: '700',
                  }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={CustomerDashboard}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
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
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 90 : 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ShopOwnerDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons 
              name={focused ? 'dashboard' : 'dashboard'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyShops"
        component={MyShopsScreen}
        options={{
          tabBarLabel: 'My Shops',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome5 
              name={focused ? 'store' : 'store'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={CreateProductScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons 
              name={focused ? 'inventory' : 'inventory'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, isAuthenticated, isLoading, currentViewMode } = useAuth();

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
        ) : currentViewMode === 'shop_owner' ? (
          // Shop Owner Flow
          <>
            <Stack.Screen name="ShopOwnerTabs" component={ShopOwnerTabNavigator} />
            <Stack.Screen name="CreateShop" component={CreateShopScreen} />
            <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
            <Stack.Screen name="MyShops" component={MyShopsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
            <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
          </>
        ) : (
          // Customer Flow
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
            <Stack.Screen name="MapScreen" component={MapScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 