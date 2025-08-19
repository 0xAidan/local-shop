import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { EmptyState } from '../components/EmptyState';
import { OptimizedImage } from '../components/OptimizedImage';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart, getCartItemsByShop } = useCart();
  const { user, currentViewMode, switchViewMode, canSwitchToShopOwner } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const cartItemsByShop = getCartItemsByShop();
  const shopIds = Object.keys(cartItemsByShop);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('Checkout');
    }, 500);
  };

  const handleRoleSwitchPress = () => {
    const newMode = currentViewMode === 'customer' ? 'shop_owner' : 'customer';
    switchViewMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCartItem = (item: any, index: number) => {
    const { product, quantity } = item;
    const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
    const itemTotal = product.price * quantity;

    return (
      <View key={`${product._id || product.id}-${index}`} style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {primaryImage ? (
            <OptimizedImage
              source={{ uri: primaryImage.url }}
              style={styles.itemImage}
              resizeMode="cover"
              placeholder="🍅"
              fallback="❌"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🍅</Text>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{product.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
            <Text style={styles.itemTotal}>${itemTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => handleQuantityChange(product._id || product.id?.toString(), quantity - 1)}
            disabled={quantity <= 1}
          >
            <Ionicons 
              name="remove" 
              size={18} 
              color={quantity <= 1 ? '#666666' : '#FFFFFF'} 
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(product._id || product.id?.toString(), quantity + 1)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(product._id || product.id?.toString())}
          >
            <MaterialIcons name="delete-outline" size={20} color="#FF4757" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderShopSection = (shopId: string, shopItems: any[]) => (
    <View key={shopId} style={styles.shopSection}>
      <View style={styles.shopHeader}>
        <Ionicons name="storefront" size={20} color="#4A90E2" />
        <Text style={styles.shopName}>{shopItems[0]?.shopName || 'Local Shop'}</Text>
        <Text style={styles.itemCount}>
          {shopItems.reduce((sum, item) => sum + item.quantity, 0)} items
        </Text>
      </View>
      {shopItems.map((item, index) => renderCartItem(item, index))}
    </View>
  );

  if (items.length === 0) {
    return (
      <ScreenWrapper>
        <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
          {/* Header with Role Switch */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            {canSwitchToShopOwner() && (
              <TouchableOpacity
                style={styles.roleSwitchButton}
                onPress={handleRoleSwitchPress}
              >
                <Ionicons 
                  name={currentViewMode === 'customer' ? 'business' : 'person'} 
                  size={20} 
                  color="#4A90E2" 
                />
              </TouchableOpacity>
            )}
          </View>

          <EmptyState
            title="Your cart is empty"
            description="Add some items from local shops to get started"
            actionText="Browse Shops"
            onAction={() => navigation.navigate('Home')}
          />
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
        {/* Header with Role Switch */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerActions}>
            {items.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
              >
                <MaterialIcons name="clear-all" size={20} color="#FF4757" />
              </TouchableOpacity>
            )}
            {canSwitchToShopOwner() && (
              <TouchableOpacity
                style={styles.roleSwitchButton}
                onPress={handleRoleSwitchPress}
              >
                <Ionicons 
                  name={currentViewMode === 'customer' ? 'business' : 'person'} 
                  size={20} 
                  color="#4A90E2" 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cart Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryPrice}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Cart Items by Shop */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {shopIds.map(shopId => renderShopSection(shopId, cartItemsByShop[shopId]))}
        </ScrollView>

        {/* Checkout Button */}
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={[styles.checkoutButton, isProcessing && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isProcessing ? ['#666666', '#555555'] : ['#4A90E2', '#357ABD']}
              style={styles.checkoutGradient}
            >
              {isProcessing ? (
                <Text style={styles.checkoutText}>Processing...</Text>
              ) : (
                <>
                  <Ionicons name="card" size={20} color="#FFFFFF" />
                  <Text style={styles.checkoutText}>
                    Checkout - ${totalPrice.toFixed(2)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  roleSwitchButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  shopSection: {
    marginBottom: 24,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  quantityControls: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  quantityButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.5)',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});