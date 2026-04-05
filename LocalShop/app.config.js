/* eslint-env node */
/**
 * API base URL (must end with /api):
 * - Set EXPO_PUBLIC_API_BASE_URL when starting Expo, or
 * - Use EAS Build env EXPO_PUBLIC_API_BASE_URL for production.
 * @see LocalShop/README.md
 */
module.exports = ({ config }) => ({
  ...config,
  scheme: 'localshop',
  ios: {
    ...(config.ios || {}),
    bundleIdentifier: process.env.IOS_BUNDLE_ID || 'com.localshop.app',
    infoPlist: {
      ...(config.ios?.infoPlist || {}),
      NSLocationWhenInUseUsageDescription:
        'This app uses location to show shops near you on the map.',
    },
  },
  android: {
    ...(config.android || {}),
    package: process.env.ANDROID_PACKAGE || 'com.localshop.app',
  },
  plugins: [
    ...(config.plugins || []),
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID || '',
        enableGooglePay: true,
      },
    ],
  ],
  extra: {
    ...(config.extra || {}),
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      'http://127.0.0.1:3001/api',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeMerchantId: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID || '',
  },
});
