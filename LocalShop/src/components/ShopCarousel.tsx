import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shop } from '../types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75;
const CARD_SPACING = 16;

interface ShopCarouselProps {
  title: string;
  shops: Shop[];
  onShopPress: (shop: Shop) => void;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export const ShopCarousel: React.FC<ShopCarouselProps> = ({
  title,
  shops,
  onShopPress,
  showViewAll = false,
  onViewAllPress,
}) => {
  if (shops.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate={Platform.OS === 'ios' ? 0 : 0.9}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      >
        {shops.map((shop, index) => (
          <TouchableOpacity
            key={shop.id || shop._id || index}
            style={styles.cardContainer}
            onPress={() => onShopPress(shop)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2A2A2A', '#1A1A1A']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Shop Image Placeholder */}
              <View style={styles.imageContainer}>
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.imagePlaceholder}
                >
                  <Text style={styles.imageText}>
                    {shop.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>

              {/* Shop Info */}
              <View style={styles.shopInfo}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shop.name}
                </Text>
                <Text style={styles.shopCategory} numberOfLines={1}>
                  {shop.category}
                </Text>
                
                <View style={styles.shopMeta}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingText}>
                      {shop.rating?.average?.toFixed(1) || 'N/A'}
                    </Text>
                    <Text style={styles.ratingCount}>
                      ({shop.rating?.count || 0})
                    </Text>
                  </View>
                  
                  {shop.distance && (
                    <Text style={styles.distance}>{shop.distance}</Text>
                  )}
                </View>

                {/* Features/Tags */}
                {shop.features && shop.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {shop.features.slice(0, 2).map((feature, idx) => (
                      <View key={`${shop.id}-feature-${idx}`} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  shopCategory: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    fontWeight: '500',
  },
  shopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#999999',
  },
  distance: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  featureText: {
    fontSize: 10,
    color: '#4A90E2',
    fontWeight: '600',
  },
}); 