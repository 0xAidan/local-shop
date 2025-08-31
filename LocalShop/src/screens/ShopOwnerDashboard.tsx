import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiService } from '../services/api';
import { Shop, User } from '../types';
import { RoleSwitcher } from '../components/RoleSwitcher';

const { width } = Dimensions.get('window');

type ShopOwnerStackParamList = {
  OrderManagement: { shop: Shop };
  ShopDetail: { shop: Shop };
  Login: undefined;
};

type ShopOwnerNavigationProp = StackNavigationProp<ShopOwnerStackParamList>;

export const ShopOwnerDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);

  const navigation = useNavigation<ShopOwnerNavigationProp>();

  const loadData = async () => {
    try {
      const [userData, shopsData] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getUserShops(),
      ]);
      setUser(userData);
      setShops(shopsData);

      // Load order statistics for all shops
      if (shopsData.length > 0) {
        try {
          const statsPromises = shopsData.map(shop => 
            apiService.getShopOrderStats(String(shop._id || shop.id || ''))
          );
          const statsResults = await Promise.all(statsPromises);
          
          // Combine stats from all shops and add pending orders to each shop
          const combinedStats = {
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0
          };
          
          statsResults.forEach((result, index) => {
            if (result.data) {
              const pendingCount = result.data.statusCounts.pending?.count || 0;
              combinedStats.totalOrders += result.data.totals.totalOrders || 0;
              combinedStats.pendingOrders += pendingCount;
              combinedStats.totalRevenue += result.data.totals.totalRevenue || 0;
              
              // Add pending orders count to the shop object
              shopsData[index].pendingOrders = pendingCount;
            }
          });
          
          if (combinedStats.totalOrders > 0) {
            combinedStats.avgOrderValue = combinedStats.totalRevenue / combinedStats.totalOrders;
          }
          
          setOrderStats(combinedStats);
          setShops([...shopsData]); // Update shops with pending order counts
        } catch (error) {
          console.error('Failed to load order stats:', error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await apiService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' as never }],
            });
          },
        },
      ]
    );
  };

  const getStats = () => {
    const totalProducts = shops.reduce((sum, shop) => sum + (shop.products?.length || 0), 0);
    const totalRating = shops.reduce((sum, shop) => sum + (shop.rating?.average || 0), 0);
    const avgRating = shops.length > 0 ? (totalRating / shops.length).toFixed(1) : '0.0';
    const activeShops = shops.filter(shop => shop.isActive).length;

    return {
      totalShops: shops.length,
      activeShops,
      totalProducts,
      avgRating,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Notification Bell */}
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => {
                // TODO: Navigate to notifications screen
                Alert.alert('Notifications', 'Notifications screen coming soon!');
              }}
            >
              <Ionicons name="notifications" size={24} color="white" />
              {orderStats && orderStats.pendingOrders > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {orderStats.pendingOrders > 9 ? '9+' : orderStats.pendingOrders}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Role Switcher - Development Mode */}
            {/* TODO: Remove this when authentication is re-enabled */}
            <RoleSwitcher />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalShops}</Text>
              <Text style={styles.statLabel}>Total Shops</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activeShops}</Text>
              <Text style={styles.statLabel}>Active Shops</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Total Products</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.avgRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </View>

        {/* Order Alerts */}
        {orderStats && orderStats.pendingOrders > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Ionicons name="notifications" size={20} color="#FF9800" />
              <Text style={styles.alertTitle}>Order Alerts</Text>
            </View>
            <View style={styles.alertContent}>
              <View style={styles.alertItem}>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{orderStats.pendingOrders}</Text>
                </View>
                <Text style={styles.alertText}>
                  {orderStats.pendingOrders === 1 ? 'New order' : 'New orders'} waiting for confirmation
                </Text>
                <TouchableOpacity
                  style={styles.alertAction}
                  onPress={() => navigation.navigate('OrderManagement', { shop: shops[0] })}
                >
                  <Text style={styles.alertActionText}>View Orders</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateShop' as never)}
            >
              <Text style={styles.actionIcon}>🏪</Text>
              <Text style={styles.actionText}>Add New Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateProduct' as never)}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Shops</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('MyShops' as never)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {shops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏪</Text>
              <Text style={styles.emptyTitle}>No shops yet</Text>
              <Text style={styles.emptySubtitle}>Create your first shop to get started!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateShop' as never)}
              >
                <Text style={styles.emptyButtonText}>Create Your First Shop</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shops.slice(0, 3).map((shop) => (
                <TouchableOpacity
                  key={shop._id || shop.id || `shop-${shop.name}`}
                  style={styles.shopCard}
                  onPress={() => navigation.navigate('ShopDetail', { shop })}
                >
                  <View style={styles.shopCardHeader}>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {shop.name}
                    </Text>
                    <View style={styles.headerRight}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: shop.isActive ? '#4CAF50' : '#9E9E9E' }
                      ]}>
                        <Text style={styles.statusText}>
                          {shop.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                      {shop.pendingOrders && shop.pendingOrders > 0 && (
                        <View style={styles.pendingOrdersBadge}>
                          <Text style={styles.pendingOrdersText}>{shop.pendingOrders}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.shopCategory}>{shop.category}</Text>
                  <Text style={styles.shopLocation} numberOfLines={1}>
                    📍 {shop.location.city}, {shop.location.state}
                  </Text>
                  <View style={styles.shopStats}>
                    <Text style={styles.shopRating}>
                      ⭐ {shop.rating?.average?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={styles.shopProducts}>
                      📦 {shop.products?.length || 0} products
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.orderManagementButton}
                    onPress={() => navigation.navigate('OrderManagement', { shop })}
                  >
                    <Text style={styles.orderManagementText}>📋 Manage Orders</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📊</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Dashboard loaded</Text>
                <Text style={styles.activityTime}>Just now</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>👋</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Welcome to Local Shop!</Text>
                <Text style={styles.activityTime}>Ready to manage your shops</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllText: {
    color: 'white',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendingOrdersBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  pendingOrdersText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  shopCategory: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 8,
  },
  shopLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopRating: {
    fontSize: 12,
    color: '#666',
  },
  shopProducts: {
    fontSize: 12,
    color: '#666',
  },
  orderManagementButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  orderManagementText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  alertContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 152, 0, 0.2)',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 8,
  },
  alertContent: {
    padding: 15,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 12,
    fontWeight: '500',
  },
  alertAction: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  alertActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
}); 