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
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../types';
import { ShopImage } from './ShopImage';
import { colors } from '../theme/colors';
import { spacing } from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.72;
const CARD_SPACING = 14;

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
          <TouchableOpacity
            onPress={onViewAllPress}
            style={styles.viewAllButton}
            accessibilityRole="button"
            accessibilityLabel={`View all ${title}`}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate={Platform.OS === 'ios' ? 0.92 : 0.9}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      >
        {shops.map((shop, index) => (
          <TouchableOpacity
            key={shop.id || shop._id || `shop-${index}`}
            style={styles.cardContainer}
            onPress={() => onShopPress(shop)}
            activeOpacity={0.92}
            accessibilityRole="button"
            accessibilityLabel={`${shop.name}, ${shop.category}`}
          >
            <View style={styles.card}>
              <ShopImage shop={shop} height={128} />

              <View style={styles.shopInfo}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shop.name}
                </Text>
                <Text style={styles.shopCategory} numberOfLines={1}>
                  {shop.category}
                </Text>

                <View style={styles.shopMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={styles.ratingText}>
                      {shop.rating?.average?.toFixed(1) ?? 'New'}
                    </Text>
                    {shop.rating?.count != null && shop.rating.count > 0 && (
                      <Text style={styles.ratingCount}>({shop.rating.count})</Text>
                    )}
                  </View>
                  {shop.distance ? (
                    <Text style={styles.distance}>{shop.distance}</Text>
                  ) : null}
                </View>

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
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 4,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  shopInfo: {
    padding: spacing.base,
  },
  shopName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  shopCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  shopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  distance: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: 'rgba(91, 159, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(91, 159, 212, 0.22)',
  },
  featureText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});
