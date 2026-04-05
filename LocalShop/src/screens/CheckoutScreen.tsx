import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import * as Haptics from 'expo-haptics';
import { getStripeMerchantId, getStripePublishableKey } from '../config/env';

interface CheckoutScreenProps {
  navigation: any;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: string;
  icon: string;
}

const CheckoutContent: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { totalPrice, clearCart, getCartItemsByShop } = useCart();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.location?.address || '',
    city: user?.location?.city || '',
    province: user?.location?.province || '',
    postalCode: user?.location?.postalCode || '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivered within 2-4 hours',
      price: 2.99,
      estimatedTime: '2-4 hours',
      icon: 'bicycle',
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Delivered within 1 hour',
      price: 5.99,
      estimatedTime: '1 hour',
      icon: 'flash',
    },
    {
      id: 'pickup',
      name: 'Store Pickup',
      description: 'Pick up from the store',
      price: 0,
      estimatedTime: '15-30 mins',
      icon: 'storefront',
    },
  ];

  const cartItemsByShop = getCartItemsByShop();
  const shopIds = Object.keys(cartItemsByShop);
  const singleShopId = shopIds.length === 1 ? shopIds[0] : null;
  const selectedDelivery = deliveryOptions.find((option) => option.id === selectedDeliveryOption);
  const deliveryFee = selectedDelivery?.price || 0;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (shopIds.length !== 1 || !singleShopId) {
      Alert.alert(
        'One shop at a time',
        'Checkout with Stripe currently supports items from a single shop. Remove items from other shops or place separate orders.',
      );
      return;
    }

    if (selectedDeliveryOption !== 'pickup') {
      if (!deliveryAddress.street || !deliveryAddress.city) {
        Alert.alert('Missing Information', 'Please fill in your delivery address.');
        return;
      }
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const shopItems = cartItemsByShop[singleShopId];
      const checkout = await apiService.createCheckoutPaymentIntent({
        shopId: singleShopId,
        items: shopItems.map((item) => ({
          productId: String(item.product._id || item.product.id),
          quantity: item.quantity,
        })),
        delivery: {
          method: selectedDeliveryOption,
          address:
            selectedDeliveryOption === 'pickup'
              ? undefined
              : {
                  street: deliveryAddress.street,
                  city: deliveryAddress.city,
                  state: deliveryAddress.province,
                  zipCode: deliveryAddress.postalCode,
                },
          instructions: specialInstructions || undefined,
        },
        payment: { method: 'card' },
        couponCode: couponCode.trim() || undefined,
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: checkout.clientSecret,
        merchantDisplayName: 'LocalShop',
        returnURL: 'localshop://stripe-redirect',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          setIsProcessing(false);
          return;
        }
        throw new Error(presentError.message);
      }

      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Payment submitted',
        'Your payment is processing. You will receive a confirmation when it completes.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('CustomerTabs', { screen: 'Home' });
            },
          },
        ],
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Checkout failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.sectionContent}>
        {shopIds.length === 0 ? (
          <Text style={styles.hintText}>Your cart is empty.</Text>
        ) : (
          shopIds.map((shopId) => {
            const shopItems = cartItemsByShop[shopId];
            const shopTotal = shopItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0,
            );

            return (
              <View key={shopId} style={styles.shopSummary}>
                <View style={styles.shopHeader}>
                  <Ionicons name="storefront" size={16} color="#4A90E2" />
                  <Text style={styles.shopName}>{shopItems[0]?.shopName || 'Local Shop'}</Text>
                  <Text style={styles.shopTotal}>${shopTotal.toFixed(2)}</Text>
                </View>
                {shopItems.map((item, index) => (
                  <View key={`${item.product._id || item.product.id}-${index}`} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })
        )}

        {shopIds.length > 1 ? (
          <Text style={styles.warningText}>
            Multiple shops in cart: complete checkout for one shop at a time. Final tax and total
            are calculated on the server when you pay.
          </Text>
        ) : null}

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (estimate):</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery (estimate):</Text>
            <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (estimate):</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotalRow]}>
            <Text style={styles.finalTotalLabel}>Total (estimate):</Text>
            <Text style={styles.finalTotalValue}>${finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDeliveryOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Options</Text>
      <View style={styles.sectionContent}>
        {deliveryOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionItem,
              selectedDeliveryOption === option.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedDeliveryOption(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.name}
          >
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={selectedDeliveryOption === option.id ? '#4A90E2' : '#CCCCCC'}
            />
            <View style={styles.optionDetails}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <View style={styles.optionPrice}>
              <Text style={styles.optionPriceText}>
                {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
              </Text>
            </View>
            {selectedDeliveryOption === option.id && (
              <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCoupon = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Promo code (optional)</Text>
      <View style={styles.sectionContent}>
        <TextInput
          style={styles.input}
          placeholder="e.g. WELCOME10"
          placeholderTextColor="#666666"
          value={couponCode}
          onChangeText={setCouponCode}
          autoCapitalize="characters"
          accessibilityLabel="Promo code"
        />
        <Text style={styles.hintText}>
          Try WELCOME10 (10% off) or SAVE5 ($5 off). Applied on the server.
        </Text>
      </View>
    </View>
  );

  const renderDeliveryAddress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {selectedDeliveryOption === 'pickup' ? 'Pickup' : 'Delivery address'}
      </Text>
      <View style={styles.sectionContent}>
        {selectedDeliveryOption === 'pickup' ? (
          <Text style={styles.hintText}>You will pick up at the shop. No address required.</Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor="#666666"
              value={deliveryAddress.street}
              onChangeText={(text) => setDeliveryAddress((prev) => ({ ...prev, street: text }))}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                placeholderTextColor="#666666"
                value={deliveryAddress.city}
                onChangeText={(text) => setDeliveryAddress((prev) => ({ ...prev, city: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Province"
                placeholderTextColor="#666666"
                value={deliveryAddress.province}
                onChangeText={(text) => setDeliveryAddress((prev) => ({ ...prev, province: text }))}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              placeholderTextColor="#666666"
              value={deliveryAddress.postalCode}
              onChangeText={(text) => setDeliveryAddress((prev) => ({ ...prev, postalCode: text }))}
            />
          </>
        )}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special instructions (optional)"
          placeholderTextColor="#666666"
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderPaymentInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment</Text>
      <View style={styles.sectionContent}>
        <Text style={styles.hintText}>
          Pay securely with Stripe (cards, Apple Pay, Google Pay where available). The amount
          charged is calculated on the server including delivery, tax, and any valid promo code.
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderOrderSummary()}
            {renderDeliveryOptions()}
            {renderCoupon()}
            {renderDeliveryAddress()}
            {renderPaymentInfo()}
          </ScrollView>

          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={isProcessing || shopIds.length === 0}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Pay with Stripe"
            >
              <LinearGradient
                colors={isProcessing ? ['#666666', '#555555'] : ['#4A90E2', '#357ABD']}
                style={styles.placeOrderGradient}
              >
                {isProcessing ? (
                  <Text style={styles.placeOrderText}>Processing...</Text>
                ) : (
                  <>
                    <MaterialIcons name="payment" size={20} color="#FFFFFF" />
                    <Text style={styles.placeOrderText}>Pay with Stripe</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export const CheckoutScreen: React.FC<CheckoutScreenProps> = (props) => {
  const publishableKey = getStripePublishableKey();
  const merchantId = getStripeMerchantId();

  if (!publishableKey) {
    return (
      <ScreenWrapper>
        <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => props.navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={{ padding: 24 }}>
            <Text style={styles.hintText}>
              Payments are not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY and rebuild the
              app. The API also needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey} merchantIdentifier={merchantId}>
      <CheckoutContent {...props} />
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hintText: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#fbbf24',
    marginBottom: 12,
    lineHeight: 20,
  },
  shopSummary: {
    marginBottom: 16,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  shopTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#CCCCCC',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  totalValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  finalTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  finalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderColor: '#4A90E2',
  },
  optionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  optionPrice: {
    marginRight: 8,
  },
  optionPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeOrderButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
