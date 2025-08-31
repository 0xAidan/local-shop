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
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiService } from '../services/api';
import { Order, Shop } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

type OrderManagementStackParamList = {
  Login: undefined;
};

type OrderManagementNavigationProp = StackNavigationProp<OrderManagementStackParamList>;

interface OrderManagementScreenProps {
  navigation: OrderManagementNavigationProp;
}

interface RouteParams {
  shop: Shop;
}

export const OrderManagementScreen: React.FC<OrderManagementScreenProps> = () => {
  const navigation = useNavigation<OrderManagementNavigationProp>();
  const route = useRoute();
  const { shop } = route.params as RouteParams;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const statusFilters = [
    { key: 'all', label: 'All Orders', color: '#667eea' },
    { key: 'pending', label: 'Pending', color: '#FF9800' },
    { key: 'confirmed', label: 'Confirmed', color: '#2196F3' },
    { key: 'preparing', label: 'Preparing', color: '#9C27B0' },
    { key: 'ready', label: 'Ready', color: '#4CAF50' },
    { key: 'completed', label: 'Completed', color: '#4CAF50' },
    { key: 'cancelled', label: 'Cancelled', color: '#F44336' },
    { key: 'refunded', label: 'Refunded', color: '#795548' },
  ];

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getShopOrders(String(shop._id || shop.id || ''), {
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getShopOrderStats(String(shop._id || shop.id || ''));
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [selectedStatus]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Show success notification with different messages based on status
      let message = `Order status updated to ${newStatus}`;
      if (newStatus === 'completed') {
        message = '🎉 Order completed successfully! Customer has been notified.';
        // Show completion celebration
        setCompletedOrderId(orderId);
        setShowCompletionCelebration(true);
        setTimeout(() => setShowCompletionCelebration(false), 3000);
      } else if (newStatus === 'ready') {
        message = '✅ Order is ready for pickup/delivery!';
      } else if (newStatus === 'preparing') {
        message = '👨‍🍳 Order preparation started!';
      }
      
      Alert.alert('Success', message);
      loadOrders();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await apiService.processRefund(String(selectedOrder?._id || selectedOrder?.id || ''), {
        refundAmount: parseFloat(refundAmount),
        reason: refundReason,
      });
      
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      loadOrders();
      loadStats();
      
      Alert.alert('Success', 'Refund processed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to process refund');
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statusFilters.find(s => s.key === status);
    return statusConfig?.color || '#667eea';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'preparing': return 'construct-outline';
      case 'ready': return 'checkmark-done-circle-outline';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle-outline';
      case 'refunded': return 'refresh-outline';
      default: return 'help-outline';
    }
  };

  const canUpdateStatus = (currentStatus: string, newStatus: string) => {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'refunded': [],
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order._id || order.id}
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(order);
        setShowOrderModal(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order._id?.slice(-8) || order.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{order.customer?.name || 'Customer'}</Text>
        <Text style={styles.customerEmail}>{order.customer?.email}</Text>
      </View>

      <View style={styles.orderItems}>
        {order.products?.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.orderItem}>
            {item.quantity}x Product #{item.productId}
          </Text>
        ))}
        {order.products && order.products.length > 2 && (
          <Text style={styles.moreItems}>+{order.products.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${order.total?.toFixed(2)}</Text>
        <View style={styles.orderActions}>
          {canUpdateStatus(order.status, 'confirmed') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleStatusUpdate(String(order._id || order.id || ''), 'confirmed')}
            >
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}
          {canUpdateStatus(order.status, 'preparing') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => handleStatusUpdate(String(order._id || order.id || ''), 'preparing')}
            >
              <Text style={styles.actionButtonText}>Start Prep</Text>
            </TouchableOpacity>
          )}
          {canUpdateStatus(order.status, 'ready') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusUpdate(String(order._id || order.id || ''), 'ready')}
            >
              <Text style={styles.actionButtonText}>Mark Ready</Text>
            </TouchableOpacity>
            )}
          {canUpdateStatus(order.status, 'completed') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusUpdate(String(order._id || order.id || ''), 'completed')}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOrderModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={() => setShowOrderModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.detailText}>Name: {selectedOrder.customer?.name}</Text>
                <Text style={styles.detailText}>Email: {selectedOrder.customer?.email}</Text>
                <Text style={styles.detailText}>Phone: {selectedOrder.customer?.phone || 'N/A'}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {selectedOrder.products?.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>Product #{item.productId}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <Text style={styles.detailText}>Subtotal: ${selectedOrder.subtotal?.toFixed(2)}</Text>
                <Text style={styles.detailText}>Tax: ${selectedOrder.tax?.toFixed(2)}</Text>
                <Text style={styles.detailText}>Delivery: ${selectedOrder.deliveryFee?.toFixed(2)}</Text>
                <Text style={styles.detailText}>Total: ${selectedOrder.total?.toFixed(2)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.modalActions}>
                  {selectedOrder.status !== 'refunded' && selectedOrder.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={[styles.modalActionButton, { backgroundColor: '#F44336' }]}
                      onPress={() => {
                        setShowOrderModal(false);
                        setShowRefundModal(true);
                      }}
                    >
                      <Text style={styles.modalActionText}>Process Refund</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderRefundModal = () => (
    <Modal
      visible={showRefundModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRefundModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Process Refund</Text>
            <TouchableOpacity onPress={() => setShowRefundModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Refund Amount ($)</Text>
              <TextInput
                style={styles.textInput}
                value={refundAmount}
                onChangeText={setRefundAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason for Refund</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={refundReason}
                onChangeText={setRefundReason}
                placeholder="Enter reason for refund"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: '#F44336' }]}
                onPress={handleRefund}
              >
                <Text style={styles.modalActionText}>Process Refund</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: '#9E9E9E' }]}
                onPress={() => setShowRefundModal(false)}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Order Management</Text>
            <Text style={styles.headerSubtitle}>{shop.name}</Text>
          </View>
        </View>

        {/* Real-time Notifications */}
        {orders.filter(o => o.status === 'pending').length > 0 && (
          <View style={styles.notificationBanner}>
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.notificationText}>
              {orders.filter(o => o.status === 'pending').length} order{orders.filter(o => o.status === 'pending').length > 1 ? 's' : ''} waiting for confirmation
            </Text>
          </View>
        )}
        
        {orders.filter(o => o.status === 'ready').length > 0 && (
          <View style={[styles.notificationBanner, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.notificationText}>
              {orders.filter(o => o.status === 'ready').length} order{orders.filter(o => o.status === 'ready').length > 1 ? 's' : ''} ready for pickup/delivery
            </Text>
          </View>
        )}

        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totals?.totalOrders || 0}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>${(stats.totals?.totalRevenue || 0).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>${(stats.totals?.avgOrderValue || 0).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Avg Order</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{orders.filter(o => o.status === 'pending').length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>
        )}

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedStatus === filter.key && { backgroundColor: filter.color }
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders List */}
        <ScrollView
          style={styles.ordersContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.ordersContent}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedStatus === 'all' 
                  ? 'Orders will appear here when customers place them'
                  : `No ${selectedStatus} orders found`
                }
              </Text>
            </View>
          ) : (
            orders.map(renderOrderCard)
          )}
        </ScrollView>

        {renderOrderModal()}
        {renderRefundModal()}
        
        {/* Completion Celebration Modal */}
        {showCompletionCelebration && (
          <View style={styles.celebrationOverlay}>
            <View style={styles.celebrationContent}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationTitle}>Order Completed!</Text>
              <Text style={styles.celebrationSubtitle}>
                Great job! This order has been successfully completed.
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  notificationBanner: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    gap: 8,
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
    fontSize: 14,
  },
  filterTextActive: {
    fontWeight: 'bold',
  },
  ordersContainer: {
    flex: 1,
  },
  ordersContent: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginBottom: 15,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 