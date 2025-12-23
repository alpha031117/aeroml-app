'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { buildApiUrl } from '@/lib/api';

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
  const hasFetchedRef = useRef(false); // Track if we've already attempted to fetch from backend

  // Load user from localStorage and fetch from backend on mount
  // This only runs once, using a ref to prevent re-fetching
  useEffect(() => {
    if (hasFetchedRef.current) return; // Already fetched
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return; // Server-side, skip
    }
    
    hasFetchedRef.current = true;
    
    // First, try to load from localStorage (for email/password login persistence)
    const storedUser = localStorage.getItem('aeroml_user');
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('aeroml_user');
      }
    }
    
    // Then, fetch from backend to check for session-based auth (Google OAuth)
    // This will override localStorage if a valid session exists
    const fetchCurrentUser = async () => {
      try {
        const meUrl = buildApiUrl("/api/v1/users/me");
        const response = await fetch(meUrl, {
          method: "GET",
          credentials: "include", // send HttpOnly JWT cookie to FastAPI
        });

        if (response.ok) {
          const userData = await response.json();
          setUserState({
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            is_active: userData.is_active,
            created_at: userData.created_at,
          });
        } else if (response.status === 401) {
          // Not authenticated; clear any stale localStorage data
          localStorage.removeItem('aeroml_user');
          setUserState(null);
        }
      } catch (error) {
        console.error("Failed to fetch /api/v1/users/me:", error);
        // On error, keep existing state (could be from localStorage)
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []); // Empty deps - only run once on mount

  const setUser = useCallback((userData: User | null) => {
    setUserState(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('aeroml_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('aeroml_user');
      }
    }
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aeroml_user');
    }
  }, []);

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




