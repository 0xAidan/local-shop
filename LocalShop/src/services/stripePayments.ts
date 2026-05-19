import Constants from 'expo-constants';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export const isStripeNativeAvailable = (): boolean => {
  const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.includes('your_key')) {
    return false;
  }
  return Constants.appOwnership !== 'expo';
};

export const presentStripePaymentSheet = async (
  clientSecret: string,
  merchantDisplayName = 'Local Shop'
): Promise<{ success: boolean; canceled?: boolean; error?: string }> => {
  const { error: initError } = await initPaymentSheet({
    merchantDisplayName,
    paymentIntentClientSecret: clientSecret,
    allowsDelayedPaymentMethods: false,
  });

  if (initError) {
    return { success: false, error: initError.message };
  }

  const { error: presentError } = await presentPaymentSheet();

  if (presentError) {
    if (presentError.code === 'Canceled') {
      return { success: false, canceled: true };
    }
    return { success: false, error: presentError.message };
  }

  return { success: true };
};
