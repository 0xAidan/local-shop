import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Shop } from '../types';
import { apiService } from '../services/api';
import { ResponsiveButton } from '../components/ResponsiveButton';

const { width: screenWidth } = Dimensions.get('window');

interface MyShopsScreenProps {
  navigation: any;
}

export const MyShopsScreen: React.FC<MyShopsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      const userShops = await apiService.getUserShops();
      setShops(userShops);
    } catch (error) {
      console.error('Error loading shops:', error);
      Alert.alert('Error', 'Failed to load shops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShops();
    setRefreshing(false);
  };

  const handleCreateShop = () => {
    navigation.navigate('CreateShop');
  };

  const handleShopPress = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shop });
  };

  const handleEditShop = (shop: Shop) => {
    // Navigate to edit shop screen (for now, show alert)
    Alert.alert('Edit Shop', `Edit functionality for ${shop.name} will be implemented soon.`);
  };

  const handleAddProduct = (shop: Shop) => {
    navigation.navigate('CreateProduct', { shopId: shop._id || shop.id });
  };

  const handleConnectSetup = (shop: Shop) => {
    navigation.navigate('ConnectOnboarding', { shop });
  };

  const handleToggleShopStatus = async (shop: Shop) => {
    const shopId = String(shop._id || shop.id);
    try {
      const updated = await apiService.updateShop(shopId, { isActive: !shop.isActive });
      setShops((prev) =>
        prev.map((s) => (String(s._id || s.id) === shopId ? { ...s, ...updated, isActive: !shop.isActive } : s))
      );
      Alert.alert('Success', `Shop ${shop.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error toggling shop status:', error);
      Alert.alert('Error', 'Failed to update shop status. Please try again.');
    }
  };

  const handleDeleteShop = (shop: Shop) => {
    Alert.alert(
      'Delete Shop',
      `Are you sure you want to delete "${shop.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const shopId = String(shop._id || shop.id);
            try {
              await apiService.deleteShop(shopId);
              setShops((prev) => prev.filter((s) => String(s._id || s.id) !== shopId));
              Alert.alert('Success', 'Shop deleted successfully!');
            } catch (error) {
              console.error('Error deleting shop:', error);
              Alert.alert('Error', 'Failed to delete shop. Please try again.');
            }
          },
        },
      ]
    );
  };

  const ShopCard = ({ shop }: { shop: Shop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopHeader}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopCategory}>{shop.category}</Text>
          <Text style={styles.shopLocation}>{shop.location.city}, {shop.location.province}</Text>
        </View>
        <View style={styles.shopStatus}>
          <View style={[styles.statusBadge, { backgroundColor: shop.isActive ? '#10b981' : '#ef4444' }]}>
            <Text style={styles.statusText}>{shop.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          {shop.isVerified && (
            <View style={[styles.statusBadge, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.statusText}>Verified</Text>
            </View>
          )}
        </View>
      </View>
      
      {shop.description && (
        <Text style={styles.shopDescription}>{shop.description}</Text>
      )}
      
      <View style={styles.shopStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{shop.rating?.average || 0}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{shop.rating?.count || 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{shop.products?.length || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
      </View>
      
      <View style={styles.shopActions}>
        <ResponsiveButton
          title="View"
          onPress={() => handleShopPress(shop)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title="Add Product"
          onPress={() => handleAddProduct(shop)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title="Orders"
          onPress={() => navigation.navigate('OrderManagement', { shop })}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title="Payments"
          onPress={() => handleConnectSetup(shop)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title="Edit"
          onPress={() => handleEditShop(shop)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title={shop.isActive ? 'Deactivate' : 'Activate'}
          onPress={() => handleToggleShopStatus(shop)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <ResponsiveButton
          title="Delete"
          onPress={() => handleDeleteShop(shop)}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Shops</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateShop}
            >
              <Text style={styles.createButtonText}>+ New Shop</Text>
            </TouchableOpacity>
          </View>
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your shops...</Text>
            </View>
          ) : shops.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No shops yet</Text>
              <Text style={styles.emptyDescription}>
                Create your first shop to start selling your products to local customers.
              </Text>
              <TouchableOpacity
                style={styles.emptyCreateButton}
                onPress={handleCreateShop}
              >
                <Text style={styles.emptyCreateButtonText}>Create Your First Shop</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{shops.length}</Text>
                  <Text style={styles.statCardLabel}>Total Shops</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>
                    {shops.filter(s => s.isActive).length}
                  </Text>
                  <Text style={styles.statCardLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>
                    {shops.filter(s => s.isVerified).length}
                  </Text>
                  <Text style={styles.statCardLabel}>Verified</Text>
                </View>
              </View>
              
              <View style={styles.shopsList}>
                {shops.map((shop) => (
                  <ShopCard key={shop.id || shop._id || `shop-${shop.name}`} shop={shop} />
                ))}
              </View>
            </>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyCreateButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#999999',
  },
  shopsList: {
    gap: 16,
  },
  shopCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  shopHeader: {
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopCategory: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
  },
  shopLocation: {
    fontSize: 14,
    color: '#999999',
  },
  shopStatus: {
    flexDirection: 'row',
    gap: 8,
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
  shopDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  shopActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Math.max(4, screenWidth * 0.01),
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: Math.max(60, screenWidth * 0.15),
    maxWidth: Math.max(80, screenWidth * 0.2),
  },

  bottomSpacing: {
    height: 40,
  },
}); 