import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../types';
import { categoryGradients, colors } from '../theme/colors';

interface ShopImageProps {
  shop: Shop;
  style?: ViewStyle;
  height?: number;
}

const getShopImageUrl = (shop: Shop): string | null => {
  if (shop.logo?.url) return shop.logo.url;
  const primary = shop.images?.find((img) => img.isPrimary) ?? shop.images?.[0];
  return primary?.url ?? null;
};

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const normalized = category.toLowerCase();
  if (normalized.includes('bakery')) return 'restaurant-outline';
  if (normalized.includes('farmers') || normalized.includes('market')) return 'leaf-outline';
  if (normalized.includes('coffee')) return 'cafe-outline';
  return 'storefront-outline';
};

export const ShopImage: React.FC<ShopImageProps> = ({
  shop,
  style,
  height = 140,
}) => {
  const imageUrl = getShopImageUrl(shop);
  const gradient = categoryGradients[shop.category] ?? categoryGradients.default;

  if (imageUrl) {
    return (
      <View style={[styles.container, { height }, style]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.imageOverlay}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[...gradient]}
      style={[styles.container, styles.placeholder, { height }, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.placeholderIconWrap}>
        <Ionicons name={getCategoryIcon(shop.category)} size={32} color={colors.textSecondary} />
      </View>
      <Text style={styles.placeholderLabel} numberOfLines={1}>
        {shop.category}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  placeholderIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
