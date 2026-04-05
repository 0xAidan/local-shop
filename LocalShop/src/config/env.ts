import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as
  | { apiBaseUrl?: string; stripePublishableKey?: string; stripeMerchantId?: string }
  | undefined;

const trimSlash = (url: string) => url.replace(/\/+$/, '');

/**
 * REST API base including /api prefix, e.g. https://api.example.com/api
 */
export const getApiBaseUrl = (): string => {
  const raw = extra?.apiBaseUrl;
  if (raw && typeof raw === 'string' && raw.length > 0) {
    return trimSlash(raw);
  }
  return 'http://127.0.0.1:3001/api';
};

export const getApiOrigin = (): string => {
  const base = getApiBaseUrl();
  if (base.endsWith('/api')) {
    return trimSlash(base.slice(0, -4));
  }
  return trimSlash(base);
};

export const getStripePublishableKey = (): string =>
  (extra?.stripePublishableKey as string) || '';

export const getStripeMerchantId = (): string | undefined =>
  (extra?.stripeMerchantId as string) || undefined;
