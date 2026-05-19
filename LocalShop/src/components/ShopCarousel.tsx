import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Shop } from '../types';
import { ShopImage } from './ShopImage';
import { colors, layout } from '../theme/colors';

const CARD_WIDTH = Dimensions.get('window').width * 0.42;

interface ShopCarouselProps {
  shops: Shop[];
  onShopPress: (shop: Shop) => void;
}

export const ShopCarousel: React.FC<ShopCarouselProps> = ({ shops, onShopPress }) => {
  if (shops.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {shops.map((shop, index) => (
        <TouchableOpacity
          key={shop.id ?? shop._id ?? index}
          style={styles.card}
          onPress={() => onShopPress(shop)}
          activeOpacity={0.85}
        >
          <ShopImage shop={shop} height={100} style={styles.image} />
          <Text style={styles.name} numberOfLines={1}>
            {shop.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {shop.category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    gap: 10,
    paddingRight: layout.screenPadding,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: {
    borderTopLeftRadius: layout.cardRadius,
    borderTopRightRadius: layout.cardRadius,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  category: {
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});
