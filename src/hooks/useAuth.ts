'use client';

import { useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import { useMemo } from 'react';

/**
 * Custom hook to check authentication status from both email login and Google OAuth
 * Returns authentication status and user information based on auth method
 */
export const useAuth = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { user, userId, isLoading: userLoading } = useUser();

  const authStatus = useMemo(() => {
    // Check if authenticated via email login (user_id exists)
    const isEmailAuthenticated = !!userId && !!user;
    
    // Check if authenticated via Google OAuth (session exists)
    const isGoogleAuthenticated = sessionStatus === 'authenticated' && !!session;
    
    // User is authenticated if either method is true
    const isAuthenticated = isEmailAuthenticated || isGoogleAuthenticated;
    
    // Determine auth method
    const authMethod: 'email' | 'google' | null = 
      isEmailAuthenticated && !isGoogleAuthenticated ? 'email' :
      isGoogleAuthenticated ? 'google' : null;

    return {
      isAuthenticated,
      isEmailAuthenticated,
      isGoogleAuthenticated,
      authMethod,
      isLoading: sessionStatus === 'loading' || userLoading,
    };
  }, [session, sessionStatus, user, userId, userLoading]);

  // Get display name based on auth method
  const displayName = useMemo(() => {
    if (authStatus.authMethod === 'email') {
      return user?.email || null;
    } else if (authStatus.authMethod === 'google') {
      return session?.user?.name || session?.user?.email || null;
    }
    return null;
  }, [authStatus.authMethod, user, session]);

  // Get user ID from either source
  const currentUserId = useMemo(() => {
    // Check email authentication first
    if (userId && user) {
      return userId;
    }
    // Check Google OAuth
    if (sessionStatus === 'authenticated' && session) {
      return (session?.user as any)?.id || null;
    }
    return null;
  }, [userId, user, sessionStatus, session]);

  // Get first letter for avatar
  const firstLetter = useMemo(() => {
    if (!displayName) return '?';
    if (authStatus.authMethod === 'email') {
      return displayName.charAt(0).toUpperCase();
    } else {
      return displayName.charAt(0).toUpperCase();
    }
  }, [displayName, authStatus.authMethod]);

  return {
    ...authStatus,
    displayName,
    userId: currentUserId,
    firstLetter,
    user, // Email login user object
    session, // Google OAuth session
  };
};

