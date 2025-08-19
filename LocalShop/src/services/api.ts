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

// Use mock API for testing (set to false to use real backend)
const USE_MOCK_API = false;
const API_BASE_URL = 'http://10.0.0.97:3001/api';

// Import mock service
import { mockApiService } from './mockApi';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  // If using mock API, return mockApiService
  private getApiService() {
    if (USE_MOCK_API) {
      return mockApiService;
    }
    return this;
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
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
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

  // Image Upload
  async uploadImage(imageUri: string, type: 'image' | 'images' | 'avatar' = 'image'): Promise<{
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
    const response = await fetch(`http://10.0.0.97:3001/health`);
    return response.json();
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
}

export const apiService = new ApiService(); 