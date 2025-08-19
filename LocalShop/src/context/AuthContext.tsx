import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentViewMode: 'customer' | 'shop_owner';
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'customer' | 'shop_owner';
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchViewMode: (mode: 'customer' | 'shop_owner') => void;
  canSwitchToShopOwner: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentViewMode, setCurrentViewMode] = useState<'customer' | 'shop_owner'>('customer');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        // Set initial view mode based on user role
        setCurrentViewMode(userData.role || 'customer');
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    setCurrentViewMode(response.data.user.role || 'customer');
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'customer' | 'shop_owner';
  }) => {
    const response = await apiService.register(userData);
    setUser(response.data.user);
    setIsAuthenticated(true);
    setCurrentViewMode(response.data.user.role || 'customer');
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentViewMode('customer');
  };

  const switchViewMode = (mode: 'customer' | 'shop_owner') => {
    if (mode === 'shop_owner' && !canSwitchToShopOwner()) {
      return;
    }
    setCurrentViewMode(mode);
  };

  const canSwitchToShopOwner = (): boolean => {
    return user?.role === 'shop_owner';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    currentViewMode,
    login,
    register,
    logout,
    switchViewMode,
    canSwitchToShopOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 