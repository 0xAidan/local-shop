import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Shop, Product } from '../types';
import { ShopLocationMap } from '../components/ShopLocationMap';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { QuickAddModal } from '../components/QuickAddModal';
import { MapPreview } from '../components/MapPreview';
import { ScreenWrapper } from '../components/ScreenWrapper';

interface ShopDetailScreenProps {
  route: {
    params: {
      shop: Shop;
    };
  };
  navigation: any;
}

export const ShopDetailScreen: React.FC<ShopDetailScreenProps> = ({ route, navigation }) => {
  const { shop } = route.params;
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  // Mock products for this shop
  const shopProducts: Product[] = [
    {
      id: 1,
      name: 'Fresh Organic Tomatoes',
      price: 3.99,
      description: 'Locally grown organic tomatoes',
      category: 'Vegetables',
      shop: shop.id?.toString() || '1',
      inventory: {
        quantity: 50,
        unit: 'pieces',
        lowStockThreshold: 10,
        isUnlimited: false
      },
      isAvailable: true,
    },
    {
      id: 2,
      name: 'Mixed Greens',
      price: 2.99,
      description: 'Fresh mixed salad greens',
      category: 'Vegetables',
      shop: shop.id?.toString() || '1',
      inventory: {
        quantity: 30,
        unit: 'bags',
        lowStockThreshold: 8,
        isUnlimited: false
      },
      isAvailable: true,
    },
    {
      id: 3,
      name: 'Carrots',
      price: 1.99,
      description: 'Sweet organic carrots',
      category: 'Vegetables',
      shop: shop.id?.toString() || '1',
      inventory: {
        quantity: 40,
        unit: 'pieces',
        lowStockThreshold: 12,
        isUnlimited: false
      },
      isAvailable: true,
    },
  ];

  const handleAddToCart = (product: Product, quantity: number) => {
    // TODO: Implement actual cart functionality
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailVisible(true);
  };

  const handleQuickAdd = (product: Product) => {
    setSelectedProduct(product);
    setQuickAddVisible(true);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    // Get the primary image or first image
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    
    return (
      <View style={styles.productCard}>
        <TouchableOpacity 
          style={styles.productCardContent}
          onPress={() => handleProductPress(product)}
          activeOpacity={0.8}
        >
          <View style={styles.productImage}>
            {primaryImage ? (
              <OptimizedImage 
                source={{ uri: primaryImage.url }} 
                style={styles.productImageActual}
                resizeMode="cover"
                placeholder="🍅"
                fallback="❌"
              />
            ) : (
              <Text style={styles.productImageText}>🍅</Text>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Quick Add Button */}
        <TouchableOpacity
          style={[styles.quickAddButton, !product.isAvailable && styles.quickAddButtonDisabled]}
          onPress={() => handleQuickAdd(product)}
          disabled={!product.isAvailable}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={product.isAvailable ? '#FFFFFF' : '#666666'} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{shop.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Shop Info */}
          <View style={styles.shopInfo}>
            <View style={styles.shopHeader}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopRating}>★ {shop.rating?.average || 0}</Text>
            </View>
            <Text style={styles.shopCategory}>{shop.category}</Text>
            <Text style={styles.shopDescription}>{shop.description}</Text>
            {shop.distance && (
              <Text style={styles.shopDistance}>{shop.distance} away</Text>
            )}
          </View>

          {/* Map Preview */}
          <MapPreview shop={shop} height={150} />

          {/* Products Section */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Products</Text>
            {shopProducts.map((product) => (
              <ProductCard key={product.id || product._id || `product-${product.name}`} product={product} />
            ))}
          </View>

          {/* Shop Owner Info */}
          {shop.owner && (
            <View style={styles.ownerSection}>
              <Text style={styles.sectionTitle}>Shop Owner</Text>
              <View style={styles.ownerInfo}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerAvatarText}>
                    {shop.owner.firstName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{shop.owner.firstName} {shop.owner.lastName}</Text>
                  <Text style={styles.ownerLabel}>Shop Owner</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          visible={productDetailVisible}
          onClose={() => {
            setProductDetailVisible(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
        />

        {/* Quick Add Modal */}
        <QuickAddModal
          product={selectedProduct}
          visible={quickAddVisible}
          onClose={() => {
            setQuickAddVisible(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
        />
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopInfo: {
    marginBottom: 20,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shopRating: {
    fontSize: 16,
    color: '#FFD700',
  },
  shopCategory: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  shopDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  shopDistance: {
    fontSize: 14,
    color: '#CCCCCC',
  },

  productsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  productCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  productImageText: {
    fontSize: 24,
  },
  productImageActual: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  quickAddButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickAddButtonDisabled: {
    backgroundColor: '#666666',
  },
  ownerSection: {
    marginBottom: 30,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 15,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
}); 