import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import * as Haptics from 'expo-haptics';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  addedAt: string;
  shopId: string;
  shopName: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  lastUpdated: string;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; variants?: Record<string, string> } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity: number, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  getCartItemsByShop: () => Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@LocalShop_cart';

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity, variants } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === product._id || item.product.id === product.id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          product,
          quantity,
          selectedVariants: variants,
          addedAt: new Date().toISOString(),
          shopId: product.shop,
          shopName: 'Local Shop', // This should come from the product or shop data
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(
        item => item.product._id !== action.payload.productId && item.product.id?.toString() !== action.payload.productId
      );
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } });
      }

      const newItems = state.items.map(item => {
        if (item.product._id === productId || item.product.id?.toString() === productId) {
          return { ...item, quantity };
        }
        return item;
      });

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString(),
      };

    case 'LOAD_CART': {
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: true,
  lastUpdated: new Date().toISOString(),
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveCart();
    }
  }, [state.items, state.isLoading]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart: CartItem[] = JSON.parse(cartData);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product: Product, quantity: number, variants?: Record<string, string>) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, variants } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(
      item => item.product._id === productId || item.product.id?.toString() === productId
    );
    return item ? item.quantity : 0;
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(
      item => item.product._id === productId || item.product.id?.toString() === productId
    );
  };

  const getCartItemsByShop = (): Record<string, CartItem[]> => {
    return state.items.reduce((acc, item) => {
      const shopId = item.shopId;
      if (!acc[shopId]) {
        acc[shopId] = [];
      }
      acc[shopId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    getCartItemsByShop,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};