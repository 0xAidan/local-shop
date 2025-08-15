import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Shop, 
  Product, 
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
    owner: mockUsers[0],
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
    owner: mockUsers[0],
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