import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function App() {
  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.com.localshop.app"
    >
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
