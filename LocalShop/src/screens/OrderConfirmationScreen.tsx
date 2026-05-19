import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors, layout } from '../theme/colors';

interface OrderConfirmationScreenProps {
  navigation: { navigate: (screen: string, params?: object) => void };
  route: {
    params: {
      orderCount: number;
      estimatedTime?: string;
    };
  };
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { orderCount, estimatedTime } = route.params;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
        </View>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.message}>
          {orderCount === 1
            ? 'Your order is confirmed.'
            : `${orderCount} orders are confirmed.`}
          {estimatedTime ? ` Estimated: ${estimatedTime}.` : ''}
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Favorites' })}
        >
          <Text style={styles.primaryBtnText}>View orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}
        >
          <Text style={styles.secondaryBtnText}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.background,
  },
  iconWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: layout.cardRadius,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  secondaryBtn: {
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
});
