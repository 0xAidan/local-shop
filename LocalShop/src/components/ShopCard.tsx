import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopCardProps {
  shop: {
    id: number;
    name: string;
    rating: number;
    distance?: string;
    category?: string;
  };
  onPress?: () => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onPress }) => {
  return (
    <TouchableOpacity style={styles.shopCard} onPress={onPress}>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{shop.name}</Text>
        {shop.category && (
          <Text style={styles.shopCategory}>{shop.category}</Text>
        )}
      </View>
      <View style={styles.shopMeta}>
        <Text style={styles.shopRating}>★ {shop.rating}</Text>
        {shop.distance && (
          <Text style={styles.shopDistance}>{shop.distance}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shopCard: {
    width: '48%',
    height: 120,
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'space-between',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopCategory: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  shopMeta: {
    alignItems: 'flex-end',
  },
  shopRating: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 2,
  },
  shopDistance: {
    fontSize: 12,
    color: '#CCCCCC',
  },
}); 