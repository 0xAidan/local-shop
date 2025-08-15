export interface Shop {
  id: number;
  name: string;
  rating: number;
  distance?: string;
  category?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  owner?: {
    id: number;
    name: string;
    avatar?: string;
  };
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  category: string;
  shopId: number;
  inStock: boolean;
}

export interface Category {
  title: string;
  shops: Shop[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  isSeller: boolean;
}

export interface Order {
  id: number;
  userId: number;
  shopId: number;
  products: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  pickupLocation: string;
  pickupTime: string;
  createdAt: string;
} 