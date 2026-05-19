import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../../types';
import { ShopImage } from '../ShopImage';
import { colors, layout } from '../../theme/colors';

interface FeaturedShopCardProps {
  shop: Shop;
  onPress: (shop: Shop) => void;
}

export const FeaturedShopCard: React.FC<FeaturedShopCardProps> = ({ shop, onPress }) => {
  const rating = shop.rating?.average?.toFixed(1);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(shop)}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Featured shop ${shop.name}`}
    >
      <ShopImage shop={shop} height={180} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Featured</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{shop.category}</Text>
          {rating ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  image: {
    borderTopLeftRadius: layout.cardRadius,
    borderTopRightRadius: layout.cardRadius,
  },
  overlay: {
    padding: 14,
    backgroundColor: colors.surface,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
