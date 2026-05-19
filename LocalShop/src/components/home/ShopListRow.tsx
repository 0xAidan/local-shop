import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../../types';
import { ShopImage } from '../ShopImage';
import { colors, layout } from '../../theme/colors';

interface ShopListRowProps {
  shop: Shop;
  onPress: (shop: Shop) => void;
}

export const ShopListRow: React.FC<ShopListRowProps> = ({ shop, onPress }) => {
  const rating = shop.rating?.average;
  const ratingLabel =
    rating != null ? rating.toFixed(1) : 'New';
  const reviewCount = shop.rating?.count ?? 0;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(shop)}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.thumb}>
        <ShopImage shop={shop} height={72} style={styles.thumbImage} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {shop.category}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={styles.metaText}>
            {ratingLabel}
            {reviewCount > 0 ? ` · ${reviewCount} reviews` : ''}
          </Text>
          {shop.distance ? (
            <Text style={styles.distance}>{shop.distance}</Text>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  thumbImage: {
    borderRadius: layout.cardRadius,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  distance: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
});
