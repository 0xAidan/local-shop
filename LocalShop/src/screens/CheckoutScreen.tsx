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
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import * as Haptics from 'expo-haptics';

interface CheckoutScreenProps {
  navigation: any;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal';
  name: string;
  icon: string;
  lastFour?: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: string;
  icon: string;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { items, totalPrice, clearCart, getCartItemsByShop } = useCart();
  const { user } = useAuth();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card1');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.location?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    zipCode: user?.location?.zipCode || '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card1', type: 'card', name: 'Credit Card', icon: 'card', lastFour: '4242' },
    { id: 'apple_pay', type: 'apple_pay', name: 'Apple Pay', icon: 'logo-apple' },
    { id: 'google_pay', type: 'google_pay', name: 'Google Pay', icon: 'logo-google' },
    { id: 'paypal', type: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  ];

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
  const selectedDelivery = deliveryOptions.find(option => option.id === selectedDeliveryOption);
  const deliveryFee = selectedDelivery?.price || 0;
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      Alert.alert('Missing Information', 'Please fill in your delivery address.');
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create orders for each shop
      const orderPromises = shopIds.map(async (shopId) => {
        const shopItems = cartItemsByShop[shopId];
        const orderData = {
          shopId,
          items: shopItems.map(item => ({
            productId: item.product._id || item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            productType: item.product.productType || 'stock'
          })),
          delivery: {
            method: selectedDeliveryOption,
            address: deliveryAddress,
            instructions: specialInstructions
          },
          payment: {
            method: selectedPaymentMethod
          }
        };

        return await apiService.createOrder(orderData);
      });

      const orders = await Promise.all(orderPromises);
      
      // Clear cart after successful order
      clearCart();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your ${orders.length} order${orders.length > 1 ? 's have' : ' has'} been confirmed. Estimated delivery: ${selectedDelivery?.estimatedTime}`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => {
              navigation.navigate('CustomerTabs', { screen: 'Home' });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Order creation error:', error);
      Alert.alert('Order Failed', 'There was an error processing your order. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.sectionContent}>
        {shopIds.map(shopId => {
          const shopItems = cartItemsByShop[shopId];
          const shopTotal = shopItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          
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
                  <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          );
        })}
        
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery:</Text>
            <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotalRow]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
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
        {deliveryOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionItem,
              selectedDeliveryOption === option.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedDeliveryOption(option.id)}
          >
            <Ionicons 
              name={option.icon as any} 
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

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.sectionContent}>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.optionItem,
              selectedPaymentMethod === method.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon as any} 
              size={24} 
              color={selectedPaymentMethod === method.id ? '#4A90E2' : '#CCCCCC'} 
            />
            <View style={styles.optionDetails}>
              <Text style={styles.optionName}>{method.name}</Text>
              {method.lastFour && (
                <Text style={styles.optionDescription}>•••• {method.lastFour}</Text>
              )}
            </View>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDeliveryAddress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <View style={styles.sectionContent}>
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          placeholderTextColor="#666666"
          value={deliveryAddress.street}
          onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, street: text }))}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="City"
            placeholderTextColor="#666666"
            value={deliveryAddress.city}
            onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, city: text }))}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="State"
            placeholderTextColor="#666666"
            value={deliveryAddress.state}
            onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, state: text }))}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ZIP Code"
          placeholderTextColor="#666666"
          value={deliveryAddress.zipCode}
          onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, zipCode: text }))}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special delivery instructions (optional)"
          placeholderTextColor="#666666"
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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
            {renderDeliveryAddress()}
            {renderPaymentMethods()}
          </ScrollView>

          {/* Place Order Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isProcessing ? ['#666666', '#555555'] : ['#4A90E2', '#357ABD']}
                style={styles.placeOrderGradient}
              >
                {isProcessing ? (
                  <Text style={styles.placeOrderText}>Processing...</Text>
                ) : (
                  <>
                    <MaterialIcons name="shopping-cart-checkout" size={20} color="#FFFFFF" />
                    <Text style={styles.placeOrderText}>
                      Place Order - ${finalTotal.toFixed(2)}
                    </Text>
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