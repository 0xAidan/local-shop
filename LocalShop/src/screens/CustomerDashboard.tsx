import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Shop, Order } from '../types';
import { ShopCard } from '../components/ShopCard';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';

interface CustomerDashboardProps {
  navigation: any;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Shop[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'orders'>('favorites');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [favoritesData, ordersResponse] = await Promise.all([
        apiService.getFavorites(),
        apiService.getMyOrders(),
      ]);

      setFavorites(favoritesData);
      setRecentOrders(ordersResponse.data.orders || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleShopPress = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shop });
  };

  const handleRemoveFavorite = (shopId: string | number) => {
    // TODO: Implement remove from favorites
    console.log('Remove from favorites:', shopId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'ready':
        return '#3b82f6';
      case 'confirmed':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ready':
        return 'Ready for Pickup';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.orderLocation}>{order.pickupLocation}</Text>
      <Text style={styles.orderDate}>
        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
      </Text>
      
      <View style={styles.orderItems}>
        {order.products.map((product, index) => (
          <Text key={`${order.id}-product-${index}`} style={styles.orderItem}>
            {product.quantity}x ${product.price.toFixed(2)}
          </Text>
        ))}
      </View>
      
      <View style={styles.orderTotal}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
      </View>
      
      {order.status === 'completed' && (
        <TouchableOpacity style={styles.reviewButton}>
          <Ionicons name="star-outline" size={16} color="#3B82F6" />
          <Text style={styles.reviewButtonText}>Write Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const QuickAction = ({
    iconName,
    title,
    onPress,
  }: {
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Ionicons name={iconName} size={22} color="#5B9FD4" />
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickAction
                iconName="search-outline"
                title="Find Shops"
                onPress={() => navigation.navigate('Home')}
              />
              <QuickAction
                iconName="qr-code-outline"
                title="Scan QR"
                onPress={() => Alert.alert('QR Scanner', 'QR scanner coming soon!')}
              />
              <QuickAction
                iconName="help-circle-outline"
                title="Support"
                onPress={() => Alert.alert('Support', 'Contact support coming soon!')}
              />
              <QuickAction
                iconName="star-outline"
                title="Rate App"
                onPress={() => Alert.alert('Rate App', 'App rating coming soon!')}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{recentOrders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {recentOrders.filter(order => order.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
              onPress={() => setActiveTab('favorites')}
            >
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                Favorites ({favorites.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
                Recent Orders ({recentOrders.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'favorites' ? (
            <View style={styles.tabContent}>
              {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No favorites yet</Text>
                  <Text style={styles.emptyDescription}>
                    Start exploring local shops and add your favorites to see them here.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text style={styles.emptyButtonText}>Explore Shops</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.favoritesList}>
                  {favorites.map((shop) => (
                    <View key={shop.id || shop._id || `favorite-${shop.name}`} style={styles.favoriteItem}>
                      <ShopCard 
                        shop={shop} 
                        onPress={() => handleShopPress(shop)}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFavorite(shop.id!)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {recentOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No orders yet</Text>
                  <Text style={styles.emptyDescription}>
                    Your order history will appear here once you place your first order.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text style={styles.emptyButtonText}>Start Shopping</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ordersList}>
                  {recentOrders.map((order) => (
                    <OrderCard key={order.id || order._id || `order-${order.createdAt}`} order={order} />
                  ))}
                </View>
              )}
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoritesList: {
    gap: 16,
  },
  favoriteItem: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderLocation: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  totalLabel: {
    fontSize: 14,
    color: '#999999',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reviewButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomSpacing: {
    height: 40,
  },
}); 