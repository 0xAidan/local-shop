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

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
const ALLOW_MOCK_FALLBACK = process.env.EXPO_PUBLIC_ALLOW_MOCK_FALLBACK === 'true';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Import mock service
import { mockApiService } from './mockApi';

class ApiService {
  private token: string | null = null;
  private useMockAsFallback: boolean = false;

  constructor() {
    this.loadToken();
  }

  // If using mock API, return mockApiService
  private getApiService() {
    if (USE_MOCK_API || this.useMockAsFallback) {
      console.log(`🔄 Using ${USE_MOCK_API ? 'mock' : 'fallback mock'} API service`);
      return mockApiService;
    }
    return this;
  }

  // Enable fallback to mock API if real API fails
  private enableMockFallback() {
    if (!ALLOW_MOCK_FALLBACK) {
      return;
    }
    if (!this.useMockAsFallback) {
      console.warn('Real API failed; using mock API fallback');
      this.useMockAsFallback = true;
    }
  }

  // Helper method to get method name from endpoint
  private getMethodName(endpoint: string): string {
    const parts = endpoint.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    
    const lastPart = parts[parts.length - 1];
    const resource = parts[0]; // auth, shops, products, etc.
    
    // Map endpoints to method names
    const methodMap: { [key: string]: string } = {
      '/auth/login': 'login',
      '/auth/register': 'register',
      '/auth/me': 'getCurrentUser',
      '/shops': 'getShops',
      '/users/shops': 'getUserShops',
      '/products': 'getProducts',
    };
    
    return methodMap[endpoint] || lastPart;
  }

  // Helper method to get method arguments
  private getMethodArgs(endpoint: string, options: RequestInit): any[] {
    // This is a simplified version - in practice, you'd need to parse the request body
    // For now, return empty array as fallback
    return [];
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('localShopToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      if (__DEV__) {
        console.log(`🌐 Making API request to: ${url}`);
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (__DEV__) {
        console.log(`📡 Response status: ${response.status}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        if (__DEV__) {
          console.error(`❌ API Error ${response.status}:`, errorData);
        }
        throw new Error(errorData.message || `HTTP ${response.status}: API request failed`);
      }

      const data = await response.json();
      if (__DEV__) {
        console.log(`✅ API request successful: ${endpoint}`);
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Type guard for error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
        this.enableMockFallback();
        const mockService = this.getApiService();
        
        // Use type assertion for dynamic method access
        const methodName = this.getMethodName(endpoint);
        if (mockService !== this && typeof (mockService as any)[methodName] === 'function') {
          console.log(`🔄 Falling back to mock API for: ${methodName}`);
          return await (mockService as any)[methodName](...this.getMethodArgs(endpoint, options));
        }
      }
      
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return this.getApiService().login(email, password);
    }

    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.data.token;
    await AsyncStorage.setItem('localShopToken', this.token);

    return response as AuthResponse;
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
    if (USE_MOCK_API) {
      return this.getApiService().register(userData);
    }

    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.data.token;
    await AsyncStorage.setItem('localShopToken', this.token);

    return response as AuthResponse;
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('localShopToken');
  }

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      return this.getApiService().getCurrentUser();
    }

    const response = await this.request<User>('/auth/me');
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Shops
  async getShops(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    sort?: string;
    order?: string;
  }): Promise<{ shops: Shop[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Shop[]>(`/shops?${queryParams.toString()}`);
    return {
      shops: response.data,
      pagination: response.pagination,
    };
  }

  async getShop(id: string): Promise<Shop> {
    const response = await this.request<Shop>(`/shops/${id}`);
    return response.data;
  }

  async createShop(shopData: ShopFormData): Promise<Shop> {
    if (USE_MOCK_API) {
      return this.getApiService().createShop(shopData);
    }

    const response = await this.request<Shop>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
    return response.data;
  }

  async updateShop(id: string, shopData: Partial<ShopFormData>): Promise<Shop> {
    const response = await this.request<Shop>(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shopData),
    });
    return response.data;
  }

  async deleteShop(id: string): Promise<void> {
    await this.request(`/shops/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserShops(): Promise<Shop[]> {
    if (USE_MOCK_API) {
      return this.getApiService().getUserShops();
    }

    const response = await this.request<Shop[]>('/users/shops');
    return response.data;
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    shopId?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    order?: string;
  }): Promise<{ products: Product[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Product[]>(`/products?${queryParams.toString()}`);
    return {
      products: response.data,
      pagination: response.pagination,
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    if (USE_MOCK_API) {
      return this.getApiService().createProduct(productData);
    }

    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductInventory(id: string, inventory: {
    quantity: number;
    isUnlimited?: boolean;
  }): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}/inventory`, {
      method: 'PATCH',
      body: JSON.stringify(inventory),
    });
    return response.data;
  }

  async getShopProducts(shopId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
  }): Promise<{ products: Product[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Product[]>(`/products/shop/${shopId}?${queryParams.toString()}`);
    return {
      products: response.data,
      pagination: response.pagination,
    };
  }

  // Reviews
  async addProductReview(productId: string, review: {
    rating: number;
    comment?: string;
  }): Promise<Product> {
    const response = await this.request<Product>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
    return response.data;
  }

  // Favorites
  async getFavorites(): Promise<Shop[]> {
    const response = await this.request<Array<{ shop: Shop; addedAt: string }>>('/users/favorites');
    return response.data.map(item => item.shop);
  }

  async addToFavorites(shopId: string): Promise<void> {
    await this.request(`/users/favorites/${shopId}`, {
      method: 'POST',
    });
  }

  async removeFromFavorites(shopId: string): Promise<void> {
    await this.request(`/users/favorites/${shopId}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getMyOrders(): Promise<{ data: { orders: any[]; pagination: any } }> {
    const response = await this.request('/orders/my');
    return response as { data: { orders: any[]; pagination: any } };
  }

  async getShopOrders(shopId: string, options: any = {}): Promise<{ data: { orders: any[]; pagination: { currentPage: number; totalPages: number; totalOrders: number; hasNext: boolean; hasPrev: boolean; }; }; }> {
    const query = new URLSearchParams(options).toString();
    const response = await this.request(`/orders/shop/${shopId}${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
    
    // Transform the response to match expected format
    const responseData = response.data as any;
    return {
      data: {
        orders: responseData.orders || [],
        pagination: responseData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false,
        }
      }
    };
  }

  async getOrder(orderId: string): Promise<{ data: any }> {
    if (USE_MOCK_API) {
      return this.getApiService().getOrder(orderId);
    }

    const response = await this.request(`/orders/${orderId}`);
    return response;
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<{ data: any }> {
    if (USE_MOCK_API) {
      return this.getApiService().updateOrderStatus(orderId, status, notes);
    }

    const response = await this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return response;
  }

  async processRefund(orderId: string, refundData: {
    refundAmount: number;
    reason: string;
    items?: any[];
  }): Promise<{ data: any }> {
    if (USE_MOCK_API) {
      return this.getApiService().processRefund(orderId, refundData);
    }

    const response = await this.request(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
    return response;
  }

  async getShopOrderStats(shopId: string, period: string = '30days'): Promise<{ data: any }> {
    if (USE_MOCK_API) {
      return this.getApiService().getShopOrderStats(shopId, period);
    }

    const response = await this.request(`/orders/shop/${shopId}/stats?period=${period}`);
    return response;
  }

  async createPaymentIntent(orderId: string): Promise<{
    data: {
      clientSecret?: string;
      paymentIntentId?: string;
      devBypass?: boolean;
      order?: any;
    };
  }> {
    const response = await this.request(`/payments/orders/${orderId}/intent`, {
      method: 'POST',
    });
    return response;
  }

  async getPaymentConfig(): Promise<{
    data: { stripeEnabled: boolean; publishableKey: string | null };
  }> {
    return this.request('/payments/config');
  }

  async startConnectOnboarding(
    shopId: string,
    urls: { returnUrl: string; refreshUrl: string }
  ): Promise<{ url: string; accountId: string }> {
    const response = await this.request<{ url: string; accountId: string }>(
      `/payments/connect/onboard/${shopId}`,
      {
        method: 'POST',
        body: JSON.stringify(urls),
      }
    );
    return response.data;
  }

  async getConnectStatus(shopId: string): Promise<{
    stripeConnectAccountId?: string;
    stripeConnectChargesEnabled?: boolean;
    stripeConnectPayoutsEnabled?: boolean;
    stripeConnectDetailsSubmitted?: boolean;
  }> {
    const response = await this.request<{
      stripeConnectAccountId?: string;
      stripeConnectChargesEnabled?: boolean;
      stripeConnectPayoutsEnabled?: boolean;
      stripeConnectDetailsSubmitted?: boolean;
    }>(`/payments/connect/status/${shopId}`);
    return response.data;
  }

  async deleteAccount(password: string): Promise<void> {
    await this.request('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    await this.logout();
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
    if (USE_MOCK_API) {
      return this.getApiService().createOrder(orderData);
    }

    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response;
  }

  // Image Upload
  async uploadImage(imageUri: string, type: 'image' | 'images' | 'avatar' | 'shop-logos' | 'shop-images' = 'image'): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append(type, {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    const headers = await this.getHeaders();
    delete (headers as any)['Content-Type']; // Let the browser set the content type for FormData

    const response = await fetch(`${API_BASE_URL}/upload/${type}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  }

  async uploadMultipleImages(imageUris: string[]): Promise<Array<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }>> {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        type: 'image/jpeg',
        name: `image${index}.jpg`,
      } as any);
    });

    const headers = await this.getHeaders();
    delete (headers as any)['Content-Type'];

    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.request(`/upload/image/${publicId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      console.log('🏥 Checking API health...');
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      console.log('✅ API health check successful:', data);
      return data;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (USE_MOCK_API) {
      return this.getApiService().isAuthenticated();
    }
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Geocoding
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await this.request<{ latitude: number; longitude: number }>('/geocoding/address', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      return response.data;
    } catch (error) {
      console.error('Geocoding failed:', error);
      // Try fallback to mock API
      try {
        console.log('🔄 Trying mock API fallback for geocoding...');
        return await this.getApiService().geocodeAddress(address);
      } catch (fallbackError) {
        console.error('Mock API fallback also failed:', fallbackError);
        return null;
      }
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await this.request<{ address: string }>('/geocoding/reverse', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
      });
      return response.data.address;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Try fallback to mock API
      try {
        console.log('🔄 Trying mock API fallback for reverse geocoding...');
        return await this.getApiService().reverseGeocode(latitude, longitude);
      } catch (fallbackError) {
        console.error('Mock API fallback also failed:', fallbackError);
        return null;
      }
    }
  }
}

export const apiService = new ApiService(); 