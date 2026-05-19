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

export const ShopImage: React.FC<ShopImageProps> = ({ shop, style, height = 140 }) => {
  const imageUrl = getShopImageUrl(shop);
  const gradient = categoryGradients[shop.category] ?? categoryGradients.default;

  if (imageUrl) {
    return (
      <View style={[styles.container, { height }, style]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[...gradient]}
      style={[styles.container, styles.placeholder, { height }, style]}
    >
      <Ionicons name="storefront-outline" size={28} color={colors.textMuted} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
