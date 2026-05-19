import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import { Shop } from '../types';

type ConnectOnboardingScreenProps = {
  navigation: any;
  route: { params: { shop: Shop } };
};

type ConnectStatus = {
  stripeConnectAccountId?: string;
  stripeConnectChargesEnabled?: boolean;
  stripeConnectPayoutsEnabled?: boolean;
  stripeConnectDetailsSubmitted?: boolean;
};

const CONNECT_RETURN_URL = process.env.EXPO_PUBLIC_CONNECT_RETURN_URL || 'localshop://connect/return';
const CONNECT_REFRESH_URL = process.env.EXPO_PUBLIC_CONNECT_REFRESH_URL || 'localshop://connect/refresh';

export const ConnectOnboardingScreen: React.FC<ConnectOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const shop = route.params.shop;
  const shopId = String(shop._id || shop.id);
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getConnectStatus(shopId);
      setStatus(data);
    } catch {
      Alert.alert('Error', 'Could not load Stripe Connect status.');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleStartOnboarding = async () => {
    setStarting(true);
    try {
      const { url } = await apiService.startConnectOnboarding(shopId, {
        returnUrl: CONNECT_RETURN_URL,
        refreshUrl: CONNECT_REFRESH_URL,
      });
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Error', 'Unable to open Stripe onboarding link.');
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Stripe Connect',
        error instanceof Error ? error.message : 'Could not start onboarding.'
      );
    } finally {
      setStarting(false);
    }
  };

  const isReady = Boolean(status?.stripeConnectChargesEnabled);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payments setup</Text>
        <Text style={styles.subtitle}>{shop.name}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#667eea" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Stripe Connect</Text>
          <Text style={[styles.status, isReady ? styles.statusOk : styles.statusPending]}>
            {isReady ? 'Ready to accept card payments' : 'Setup required'}
          </Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Details submitted</Text>
            <Text style={styles.rowValue}>{status?.stripeConnectDetailsSubmitted ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Charges enabled</Text>
            <Text style={styles.rowValue}>{status?.stripeConnectChargesEnabled ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payouts enabled</Text>
            <Text style={styles.rowValue}>{status?.stripeConnectPayoutsEnabled ? 'Yes' : 'No'}</Text>
          </View>

          {!isReady ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartOnboarding}
              disabled={starting}
              accessibilityRole="button"
              accessibilityLabel="Start Stripe Connect onboarding"
            >
              <Text style={styles.primaryButtonText}>
                {starting ? 'Opening Stripe…' : 'Complete Stripe setup'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={loadStatus}
            accessibilityRole="button"
            accessibilityLabel="Refresh Connect status"
          >
            <Text style={styles.secondaryButtonText}>Refresh status</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },
  back: {
    color: '#667eea',
    marginBottom: 12,
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#999',
    marginTop: 4,
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusOk: {
    color: '#10b981',
  },
  statusPending: {
    color: '#fbbf24',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rowLabel: {
    color: '#ccc',
  },
  rowValue: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
});
