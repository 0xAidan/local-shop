import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shop, Product } from '../types';

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

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImage}>
        <Text style={styles.productImageText}>🍅</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.backButtonText}>←</Text>
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

          {/* Map Location Button */}
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Map Location</Text>
          </TouchableOpacity>

          {/* Products Section */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Products</Text>
            {shopProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
      </LinearGradient>
    </SafeAreaView>
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
  mapButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
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
    padding: 15,
    marginBottom: 12,
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