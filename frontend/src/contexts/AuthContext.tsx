/**
 * Authentication Context
 * Manages authentication state and provides login/logout functionality
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthUser } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TOKEN_KEY = 'vnotes_session_token';
const USER_DATA_KEY = 'vnotes_user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  });

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_TOKEN_KEY) {
        setSessionToken(e.newValue);
      }
      if (e.key === USER_DATA_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setSessionToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setSessionToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    sessionToken,
    isAuthenticated: !!sessionToken && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
