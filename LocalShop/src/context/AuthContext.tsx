import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

// 🚨 DEVELOPMENT MODE: Authentication is bypassed for testing
// TODO: Re-enable authentication when MVP is complete
// - Uncomment useEffect and checkAuthentication
// - Set isAuthenticated to false initially
// - Restore proper user state management

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
  // DEVELOPMENT MODE: Bypass authentication for testing
  const [user, setUser] = useState<User | null>({
    id: 'dev-user-1',
    username: 'devuser',
    email: 'dev@example.com',
    firstName: 'Dev',
    lastName: 'User',
    role: 'customer',
    phone: '+1234567890'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<'customer' | 'shop_owner'>('customer');

  // DEVELOPMENT MODE: Skip authentication check
  // useEffect(() => {
  //   checkAuthentication();
  // }, []);

  const checkAuthentication = async () => {
    // DEVELOPMENT MODE: Skip authentication
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    const userRole = response.data.user.role;
    if (userRole === 'customer' || userRole === 'shop_owner') {
      setCurrentViewMode(userRole);
    } else {
      setCurrentViewMode('customer');
    }
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
    const userRole = response.data.user.role;
    if (userRole === 'customer' || userRole === 'shop_owner') {
      setCurrentViewMode(userRole);
    } else {
      setCurrentViewMode('customer');
    }
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
    // DEVELOPMENT MODE: Allow switching to shop owner for testing
    return true;
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