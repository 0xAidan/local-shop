import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
    Alert.alert('Success', `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`);
  };

  const increaseQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const totalPrice = product.price * quantity;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
              {primaryImage ? (
                <OptimizedImage
                  source={{ uri: primaryImage.url }}
                  style={styles.productImage}
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

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
              
              {product.description && (
                <Text style={styles.productDescription}>{product.description}</Text>
              )}

              {/* Product Details */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{product.category}</Text>
                </View>

                {product.subcategory && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Subcategory:</Text>
                    <Text style={styles.detailValue}>{product.subcategory}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Availability:</Text>
                  <Text style={[styles.detailValue, { color: product.isAvailable ? '#4CAF50' : '#F44336' }]}>
                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>

                {product.inventory && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock:</Text>
                    <Text style={styles.detailValue}>
                      {product.inventory.isUnlimited ? 'Unlimited' : `${product.inventory.quantity} ${product.inventory.unit}`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Dietary Information */}
              {product.dietary && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Dietary Information</Text>
                  <View style={styles.dietaryTags}>
                    {Object.entries(product.dietary).map(([key, value]) => {
                      if (value) {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                          <View key={key} style={styles.dietaryTag}>
                            <Text style={styles.dietaryTagText}>{label}</Text>
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                </View>
              )}

              {/* Allergens */}
              {product.allergens && product.allergens.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Allergens</Text>
                  <View style={styles.allergenTags}>
                    {product.allergens.map((allergen, index) => (
                      <View key={index} style={styles.allergenTag}>
                        <Text style={styles.allergenTagText}>{allergen}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Origin Information */}
              {product.origin && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Origin</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Local:</Text>
                    <Text style={styles.detailValue}>
                      {product.origin.isLocal ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  {product.origin.region && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Region:</Text>
                      <Text style={styles.detailValue}>{product.origin.region}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? '#666666' : '#FFFFFF'} 
                />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
                disabled={quantity >= 99}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= 99 ? '#666666' : '#FFFFFF'} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addToCartButton, !product.isAvailable && styles.addToCartButtonDisabled]}
              onPress={handleAddToCart}
              disabled={!product.isAvailable}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={product.isAvailable ? ['#4A90E2', '#357ABD'] : ['#666666', '#555555']}
                style={styles.addToCartGradient}
              >
                <Ionicons name="cart" size={20} color="#FFFFFF" />
                <Text style={styles.addToCartText}>
                  Add to Cart - ${totalPrice.toFixed(2)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
    opacity: 0.5,
  },
  productInfo: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom bar
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  dietaryTagText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  allergenTagText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
}); 