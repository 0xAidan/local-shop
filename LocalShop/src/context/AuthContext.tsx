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
  refreshUser: () => Promise<void>;
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

const resolveViewModeFromUser = (u: User | null): 'customer' | 'shop_owner' => {
  if (!u) return 'customer';
  const role = u.role;
  if (role === 'shop_owner' || role === 'admin') {
    return 'shop_owner';
  }
  return 'customer';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentViewMode, setCurrentViewMode] = useState<'customer' | 'shop_owner'>('customer');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setIsLoading(true);
    try {
      await apiService.refreshTokenFromStorage();
      if (!apiService.isAuthenticated()) {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentViewMode('customer');
        return;
      }
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentViewMode(resolveViewModeFromUser(userData));
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setCurrentViewMode('customer');
      await apiService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    setCurrentViewMode(resolveViewModeFromUser(response.data.user));
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
    setCurrentViewMode(resolveViewModeFromUser(response.data.user));
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentViewMode('customer');
  };

  const refreshUser = async () => {
    if (!apiService.isAuthenticated()) return;
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch {
      await logout();
    }
  };

  const switchViewMode = (mode: 'customer' | 'shop_owner') => {
    if (mode === 'shop_owner' && !canSwitchToShopOwner()) {
      return;
    }
    setCurrentViewMode(mode);
  };

  const canSwitchToShopOwner = (): boolean => {
    const role = user?.role;
    return role === 'shop_owner' || role === 'admin';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    currentViewMode,
    login,
    register,
    logout,
    refreshUser,
    switchViewMode,
    canSwitchToShopOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
