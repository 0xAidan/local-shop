import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Shop, 
  Product, 
  Order,
  AuthResponse, 
  ApiResponse, 
  ShopFormData, 
  ProductFormData 
} from '../types';

// Mock data
const mockUsers: User[] = [
  {
    _id: '1',
    username: 'shopowner1',
    email: 'owner@test.com',
    firstName: 'John',
    lastName: 'ShopOwner',
    role: 'shop_owner',
    isVerified: true,
    isActive: true,
  },
  {
    _id: '2',
    username: 'customer1',
    email: 'customer@test.com',
    firstName: 'Jane',
    lastName: 'Customer',
    role: 'customer',
    isVerified: true,
    isActive: true,
  }
];

const mockShops: Shop[] = [
  {
    _id: '1',
    name: 'Fresh Market',
    description: 'Your local source for fresh produce and groceries',
    category: 'Grocery',
    location: {
      address: '123 Main St',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 1A1'
    },
    owner: {
      _id: mockUsers[0]._id,
      id: mockUsers[0].id,
      firstName: mockUsers[0].firstName,
      lastName: mockUsers[0].lastName,
      username: mockUsers[0].username,
      avatar: mockUsers[0].avatar?.url,
    },
    isActive: true,
    isVerified: true,
    rating: { average: 4.5, count: 12 },
    products: []
  },
  {
    _id: '2',
    name: 'Artisan Bakery',
    description: 'Handcrafted breads and pastries',
    category: 'Bakery',
    location: {
      address: '456 Oak Ave',
      coordinates: { latitude: 48.3850, longitude: -89.2500 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 2B2'
    },
    owner: {
      _id: mockUsers[0]._id,
      id: mockUsers[0].id,
      firstName: mockUsers[0].firstName,
      lastName: mockUsers[0].lastName,
      username: mockUsers[0].username,
      avatar: mockUsers[0].avatar?.url,
    },
    isActive: true,
    isVerified: true,
    rating: { average: 4.8, count: 8 },
    products: []
  }
];

const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Organic Apples',
    description: 'Fresh organic apples from local orchards',
    price: 4.99,
    category: 'Produce',
    shop: '1',
    inventory: {
      quantity: 50,
      unit: 'pieces',
      lowStockThreshold: 10,
      isUnlimited: false
    },
    isAvailable: true,
    averageRating: 4.5,
    reviewCount: 5
  },
  {
    _id: '2',
    name: 'Sourdough Bread',
    description: 'Traditional sourdough bread baked daily',
    price: 6.99,
    category: 'Bakery',
    shop: '2',
    inventory: {
      quantity: 20,
      unit: 'loaves',
      lowStockThreshold: 5,
      isUnlimited: false
    },
    isAvailable: true,
    averageRating: 4.8,
    reviewCount: 12
  }
];

// Mock order data
const mockOrders: Order[] = [
  {
    _id: '1',
    id: 1,
    userId: '2',
    shopId: '1',
    products: [
      {
        productId: '1',
        quantity: 2,
        price: 4.99,
        productType: 'stock' as const,
      },
      {
        productId: '2',
        quantity: 1,
        price: 3.99,
        productType: 'stock' as const,
      }
    ],
    subtotal: 9.98,
    tax: 0.80,
    total: 10.78,
    status: 'pending',
    paymentStatus: 'paid',
    pickupLocation: 'Fresh Market - 123 Main St',
    pickupTime: '2024-01-15T14:00:00Z',
    financials: {
      platformFee: 0.32,
      netAmount: 10.46,
      currency: 'CAD'
    },
    returnEligible: true,
    returnWindow: 30,
    createdAt: '2024-01-15T10:00:00Z',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
    shop: {
      shopId: '1',
      name: 'Fresh Market',
      location: {
        address: '123 Main St',
        city: 'Thunder Bay',
        state: 'ON',
        zipCode: 'P7A 1A1'
      }
    },
    items: [
      {
        product: '1',
        name: 'Organic Apples',
        quantity: 2,
        unitPrice: 4.99,
        totalPrice: 9.98,
        productType: 'stock'
      }
    ],
    delivery: {
      method: 'pickup',
      address: {
        street: '123 Main St',
        city: 'Thunder Bay',
        state: 'ON',
        zipCode: 'P7A 1A1'
      },
      instructions: 'Please have order ready at counter',
      estimatedTime: '15-30 mins'
    },
    payment: {
      method: 'card',
      status: 'paid',
      transactionId: 'txn_123456',
      paidAt: new Date('2024-01-15T10:05:00Z')
    }
  },
  {
    _id: '2',
    id: 2,
    userId: '2',
    shopId: '2',
    products: [
      {
        productId: '2',
        quantity: 1,
        price: 6.99,
        productType: 'stock'
      }
    ],
    subtotal: 6.99,
    tax: 0.56,
    total: 7.55,
    status: 'confirmed',
    paymentStatus: 'paid',
    pickupLocation: 'Artisan Bakery - 456 Oak Ave',
    pickupTime: '2024-01-15T16:00:00Z',
    financials: {
      platformFee: 0.22,
      netAmount: 7.33,
      currency: 'CAD'
    },
    returnEligible: true,
    returnWindow: 30,
    createdAt: '2024-01-15T11:00:00Z',
    customer: {
      name: 'Jane Customer',
      email: 'customer@test.com',
      phone: '555-0123',
      address: {
        street: '789 Customer St',
        city: 'Thunder Bay',
        state: 'ON',
        zipCode: 'P7A 3C3'
      }
    },
    shop: {
      shopId: '2',
      name: 'Artisan Bakery',
      location: {
        address: '456 Oak Ave',
        city: 'Thunder Bay',
        state: 'ON',
        zipCode: 'P7A 2B2'
      }
    },
    items: [
      {
        product: '2',
        name: 'Sourdough Bread',
        quantity: 1,
        unitPrice: 6.99,
        totalPrice: 6.99,
        productType: 'stock'
      }
    ],
    delivery: {
      method: 'pickup',
      address: {
        street: '456 Oak Ave',
        city: 'Thunder Bay',
        state: 'ON',
        zipCode: 'P7A 2B2'
      },
      instructions: 'Fresh bread, please handle with care',
      estimatedTime: '15-30 mins'
    },
    payment: {
      method: 'card',
      status: 'paid',
      transactionId: 'txn_123457',
      paidAt: new Date('2024-01-15T11:05:00Z')
    }
  }
];

class MockApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('localShopToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    await this.delay();
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = user;
    this.token = 'mock-token-' + Date.now();
    await AsyncStorage.setItem('localShopToken', this.token);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user,
        token: this.token
      }
    };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'customer' | 'shop_owner';
  }): Promise<AuthResponse> {
    await this.delay();
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      _id: (mockUsers.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || 'customer',
      isVerified: true,
      isActive: true,
    };

    mockUsers.push(newUser);
    this.currentUser = newUser;
    this.token = 'mock-token-' + Date.now();
    await AsyncStorage.setItem('localShopToken', this.token);

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        token: this.token
      }
    };
  }

  async logout(): Promise<void> {
    await this.delay();
    this.token = null;
    this.currentUser = null;
    await AsyncStorage.removeItem('localShopToken');
  }

  async getCurrentUser(): Promise<User> {
    await this.delay();
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    return this.currentUser;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    await this.delay();
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    this.currentUser = { ...this.currentUser, ...profileData };
    return this.currentUser;
  }

  // Shops
  async getShops(params?: any): Promise<{ shops: Shop[]; pagination?: any }> {
    await this.delay();
    return {
      shops: mockShops,
      pagination: { page: 1, limit: 10, total: mockShops.length, pages: 1 }
    };
  }

  async getShop(id: string): Promise<Shop> {
    await this.delay();
    const shop = mockShops.find(s => s._id === id);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  }

  async createShop(shopData: ShopFormData): Promise<Shop> {
    await this.delay();
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const newShop: Shop = {
      _id: (mockShops.length + 1).toString(),
      ...shopData,
      location: {
        ...shopData.location,
        coordinates: { latitude: 48.3809, longitude: -89.2477 } // Mock coordinates
      },
      owner: this.currentUser,
      isActive: true,
      isVerified: false,
      rating: { average: 0, count: 0 },
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockShops.push(newShop);
    return newShop;
  }

  async updateShop(id: string, shopData: Partial<ShopFormData>): Promise<Shop> {
    await this.delay();
    const shopIndex = mockShops.findIndex(s => s._id === id);
    if (shopIndex === -1) {
      throw new Error('Shop not found');
    }
    
    mockShops[shopIndex] = { ...mockShops[shopIndex], ...shopData };
    return mockShops[shopIndex];
  }

  async deleteShop(id: string): Promise<void> {
    await this.delay();
    const shopIndex = mockShops.findIndex(s => s._id === id);
    if (shopIndex === -1) {
      throw new Error('Shop not found');
    }
    mockShops.splice(shopIndex, 1);
  }

  async getUserShops(): Promise<Shop[]> {
    await this.delay();
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    return mockShops.filter(shop => shop.owner?._id === this.currentUser?._id);
  }

  // Products
  async getProducts(params?: any): Promise<{ products: Product[]; pagination?: any }> {
    await this.delay();
    return {
      products: mockProducts,
      pagination: { page: 1, limit: 10, total: mockProducts.length, pages: 1 }
    };
  }

  async getProduct(id: string): Promise<Product> {
    await this.delay();
    const product = mockProducts.find(p => p._id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    await this.delay();
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const newProduct: Product = {
      _id: (mockProducts.length + 1).toString(),
      ...productData,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockProducts.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    await this.delay();
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...productData };
    return mockProducts[productIndex];
  }

  // Order Management
  async getShopOrders(shopId: string, options: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: {
      orders: Order[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalOrders: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }> {
    await this.delay();
    
    let filteredOrders = mockOrders.filter(order => order.shopId === shopId);
    
    if (options.status && options.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === options.status);
    }
    
    const totalOrders = filteredOrders.length;
    const currentPage = options.page || 1;
    const limit = options.limit || 20;
    const totalPages = Math.ceil(totalOrders / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      data: {
        orders: paginatedOrders,
        pagination: {
          currentPage,
          totalPages,
          totalOrders,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        }
      }
    };
  }

  async getOrder(orderId: string): Promise<{ data: Order }> {
    await this.delay();
    const order = mockOrders.find(o => o._id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return { data: order };
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<{ data: Order }> {
    await this.delay();
    const orderIndex = mockOrders.findIndex(o => o._id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    mockOrders[orderIndex].status = status as any;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    
    return { data: mockOrders[orderIndex] };
  }

  async processRefund(orderId: string, refundData: {
    refundAmount: number;
    reason: string;
    items?: any[];
  }): Promise<{ data: Order }> {
    await this.delay();
    const orderIndex = mockOrders.findIndex(o => o._id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    mockOrders[orderIndex].status = 'refunded';
    mockOrders[orderIndex].paymentStatus = 'refunded';
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    
    return { data: mockOrders[orderIndex] };
  }

  async getShopOrderStats(shopId: string, period: string = '30days'): Promise<{ data: any }> {
    await this.delay();
    
    const shopOrders = mockOrders.filter(order => order.shopId === shopId);
    
    const statusCounts: { [key: string]: { count: number; revenue: number } } = {};
    let totalRevenue = 0;
    
    shopOrders.forEach(order => {
      const status = order.status;
      if (!statusCounts[status]) {
        statusCounts[status] = { count: 0, revenue: 0 };
      }
      statusCounts[status].count++;
      statusCounts[status].revenue += order.total || 0;
      totalRevenue += order.total || 0;
    });
    
    const avgOrderValue = shopOrders.length > 0 ? totalRevenue / shopOrders.length : 0;
    
    return {
      data: {
        period,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        statusCounts,
        totals: {
          totalOrders: shopOrders.length,
          totalRevenue,
          avgOrderValue
        }
      }
    };
  }

  async createOrder(orderData: {
    shopId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      productType?: 'stock' | 'unique' | 'service';
    }>;
    delivery: {
      method: string;
      address?: any;
      instructions?: string;
    };
    payment: {
      method: string;
    };
  }): Promise<{ data: any }> {
    await this.delay();
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Create new order
    const newOrder: Order = {
      _id: (mockOrders.length + 1).toString(),
      id: mockOrders.length + 1,
      userId: this.currentUser._id,
      shopId: orderData.shopId,
      products: orderData.items,
      subtotal: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: 0, // Calculate tax based on location
      total: 0, // Will be calculated
      status: 'pending',
      paymentStatus: 'paid',
      pickupLocation: 'Store Location',
      pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      financials: {
        platformFee: 0,
        netAmount: 0,
        currency: 'CAD'
      },
      returnEligible: true,
      returnWindow: 30,
      createdAt: new Date().toISOString(),
      customer: {
        name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        email: this.currentUser.email,
        phone: this.currentUser.phone || '',
      },
      shop: {
        shopId: orderData.shopId,
        name: 'Local Shop',
        location: {
          address: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      items: orderData.items.map(item => ({
        product: item.productId,
        name: 'Product',
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        productType: item.productType || 'stock'
      })),
      delivery: {
        method: orderData.delivery.method as any,
        address: orderData.delivery.address,
        instructions: orderData.delivery.instructions,
        estimatedTime: '15-30 mins'
      },
      payment: {
        method: orderData.payment.method as any,
        status: 'paid',
        transactionId: `txn_${Date.now()}`,
        paidAt: new Date()
      }
    };

    // Calculate totals
    newOrder.tax = newOrder.subtotal * 0.08; // 8% tax
    newOrder.total = newOrder.subtotal + newOrder.tax;
    newOrder.financials.platformFee = newOrder.total * 0.029 + 0.30; // 2.9% + $0.30
    newOrder.financials.netAmount = newOrder.total - newOrder.financials.platformFee;

    mockOrders.push(newOrder);
    
    return { data: newOrder };
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay();
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    mockProducts.splice(productIndex, 1);
  }

  async updateProductInventory(id: string, inventory: any): Promise<Product> {
    await this.delay();
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    mockProducts[productIndex].inventory = { ...mockProducts[productIndex].inventory, ...inventory };
    return mockProducts[productIndex];
  }

  async getShopProducts(shopId: string, params?: any): Promise<{ products: Product[]; pagination?: any }> {
    await this.delay();
    const products = mockProducts.filter(p => p.shop === shopId);
    return {
      products,
      pagination: { page: 1, limit: 10, total: products.length, pages: 1 }
    };
  }

  // Reviews
  async addProductReview(productId: string, review: any): Promise<Product> {
    await this.delay();
    const productIndex = mockProducts.findIndex(p => p._id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    // Mock review addition
    return mockProducts[productIndex];
  }

  // Favorites
  async getFavorites(): Promise<Shop[]> {
    await this.delay();
    return mockShops.slice(0, 2); // Return first 2 shops as favorites
  }

  async addToFavorites(shopId: string): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  async removeFromFavorites(shopId: string): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  // Image Upload (mock)
  async uploadImage(imageUri: string, type: string = 'image'): Promise<any> {
    await this.delay();
    return {
      url: 'https://via.placeholder.com/300x200',
      publicId: 'mock-image-id',
      width: 300,
      height: 200,
      format: 'jpeg',
      size: 50000
    };
  }

  async uploadMultipleImages(imageUris: string[]): Promise<any[]> {
    await this.delay();
    return imageUris.map((_, index) => ({
      url: `https://via.placeholder.com/300x200?text=Image${index + 1}`,
      publicId: `mock-image-id-${index}`,
      width: 300,
      height: 200,
      format: 'jpeg',
      size: 50000
    }));
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    await this.delay();
    return { status: 'ok', message: 'Mock API is running' };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }
}

export const mockApiService = new MockApiService(); 