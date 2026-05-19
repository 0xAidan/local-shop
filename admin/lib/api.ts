const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('localShopAdminToken');
};

export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const adminLogin = async (email: string, password: string) => {
  const result = await apiRequest<{ success: boolean; data: { token: string; user: { role: string } } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

  if (result.data.user.role !== 'admin') {
    throw new Error('Admin access only');
  }

  localStorage.setItem('localShopAdminToken', result.data.token);
  return result;
};

export const adminLogout = () => {
  localStorage.removeItem('localShopAdminToken');
};
