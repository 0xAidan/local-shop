import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { Order, Shop } from '../types';

interface OrderWithShop extends Order {
  shop?: Shop;
}

export const OrderManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userShops, setUserShops] = useState<Shop[]>([]);

  useEffect(() => {
    loadUserShops();
    loadOrders();
  }, []);

  const loadUserShops = async () => {
    try {
      const shops = await apiService.getUserShops();
      setUserShops(shops);
    } catch (error) {
      console.error('Error loading user shops:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders: OrderWithShop[] = [];

      // Load orders for each shop
      for (const shop of userShops) {
        try {
          const response = await apiService.getShopOrders(shop._id!);
          const shopOrders = response.data.orders.map((order: any) => ({
            ...order,
            shop: shop,
          }));
          allOrders.push(...shopOrders);
        } catch (error) {
          console.error(`Error loading orders for shop ${shop.name}:`, error);
        }
      }

      // Sort orders by creation date (most recent first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserShops();
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4A90E2';
      case 'preparing':
        return '#9B59B6';
      case 'ready':
        return '#27AE60';
      case 'completed':
        return '#2ECC71';
      case 'cancelled':
        return '#E74C3C';
      case 'refunded':
        return '#95A5A6';
      default:
        return '#95A5A6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-done-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'refunded':
        return 'refresh-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getDeliveryMethodIcon = (method: string) => {
    return method === 'delivery' ? 'car-outline' : 'bag-outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const renderOrderItem = ({ item }: { item: OrderWithShop }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.shop?.name || 'Unknown Shop'}</Text>
          <Text style={styles.orderId}>Order #{item._id?.slice(-8)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.deliveryInfo}>
          <Ionicons 
            name={getDeliveryMethodIcon(item.pickupLocation.includes('delivery') ? 'delivery' : 'pickup') as any} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.deliveryText}>
            {item.pickupLocation.includes('delivery') ? 'Delivery' : 'Pickup'}
          </Text>
        </View>

        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.itemsContainer}>
        {item.products?.slice(0, 2).map((product, index) => (
          <Text key={index} style={styles.itemText}>
            {product.quantity}x {product.productId} - {formatCurrency(product.price)}
          </Text>
        ))}
        {item.products && item.products.length > 2 && (
          <Text style={styles.moreItemsText}>
            +{item.products.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: {formatCurrency(item.total)}</Text>
        
        {item.status === 'refunded' && (
          <View style={styles.refundBadge}>
            <Ionicons name="refresh-outline" size={14} color="#E74C3C" />
            <Text style={styles.refundText}>Refunded</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#999" />
      <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Orders from your shops will appear here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Recent orders from your shops</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refundText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
}); 