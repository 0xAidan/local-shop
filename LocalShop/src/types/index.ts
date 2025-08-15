export interface Shop {
  _id?: string;
  id?: number;
  name: string;
  description?: string;
  category: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    city: string;
    state: string;
    zipCode: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  images?: Array<{
    url: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  owner?: {
    _id?: string;
    id?: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
  isActive?: boolean;
  isVerified?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  distance?: string;
  tags?: string[];
  features?: string[];
  products?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id?: string;
  id?: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  category: string;
  subcategory?: string;
  shop: string;
  images?: Array<{
    url: string;
    caption?: string;
    isPrimary?: boolean;
    altText?: string;
  }>;
  inventory: {
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    isUnlimited: boolean;
  };
  isAvailable: boolean;
  isFeatured?: boolean;
  tags?: string[];
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  dietary?: {
    isGlutenFree: boolean;
    isVegan: boolean;
    isVegetarian: boolean;
    isOrganic: boolean;
    isHalal: boolean;
    isKosher: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
  };
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  preparation?: {
    prepTime?: number;
    cookTime?: number;
    servingSize?: string;
    instructions?: string;
  };
  allergens?: string[];
  origin?: {
    country?: string;
    region?: string;
    isLocal: boolean;
  };
  expiry?: {
    hasExpiry: boolean;
    shelfLife?: number;
    bestBefore?: string;
  };
  variants?: Array<{
    name: string;
    options: Array<{
      value: string;
      priceModifier: number;
      isAvailable: boolean;
    }>;
  }>;
  reviews?: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    rating: number;
    comment?: string;
    createdAt: string;
  }>;
  averageRating?: number;
  reviewCount?: number;
  shopId?: number;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  title: string;
  shops: Shop[];
}

export interface User {
  _id?: string;
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  phone?: string;
  role: 'customer' | 'shop_owner' | 'admin';
  isVerified?: boolean;
  isActive?: boolean;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  preferences?: {
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dietary?: {
      isVegetarian: boolean;
      isVegan: boolean;
      isGlutenFree: boolean;
      isHalal: boolean;
      isKosher: boolean;
    };
    radius?: number;
  };
  shops?: Shop[];
  favorites?: Array<{
    shop: Shop;
    addedAt: string;
  }>;
  orders?: Order[];
  reviews?: Array<{
    shop?: Shop;
    product?: Product;
    rating: number;
    comment?: string;
    createdAt: string;
  }>;
  lastLogin?: string;
}

export interface Order {
  _id?: string;
  id?: number;
  userId: string;
  shopId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  pickupLocation: string;
  pickupTime: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ShopFormData {
  name: string;
  description?: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  tags?: string[];
  features?: string[];
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  shop: string;
  inventory: {
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    isUnlimited: boolean;
  };
  isAvailable: boolean;
  isFeatured?: boolean;
  tags?: string[];
  dietary?: {
    isGlutenFree: boolean;
    isVegan: boolean;
    isVegetarian: boolean;
    isOrganic: boolean;
    isHalal: boolean;
    isKosher: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
  };
  allergens?: string[];
  origin?: {
    country?: string;
    region?: string;
    isLocal: boolean;
  };
} 