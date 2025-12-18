'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('aeroml_user');
      if (storedUser) {
        try {
          setUserState(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('aeroml_user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const setUser = (userData: User | null) => {
    setUserState(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('aeroml_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('aeroml_user');
      }
    }
  };

  const clearUser = () => {
    setUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aeroml_user');
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userId: user?.id || null,
        setUser,
        clearUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};




