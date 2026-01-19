'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // If we had a persist endpoint we'd verify here, or just decode if we trust local storage for UI state
          // For now, let's fetch 'me' to be safe
           const { data } = await api.get('/auth/me');
           setUser(data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
