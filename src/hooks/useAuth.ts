'use client';

import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';

/**
 * Custom auth hook backed purely by the FastAPI backend.
 *
 * The backend (email/password login or Google OAuth) is responsible for setting
 * a JWT session in an HttpOnly cookie. On the frontend, we keep the current
 * user in `UserContext`, which can be populated from `/api/v1/users/me`.
 */
export const useAuth = () => {
  const { user, userId, isLoading } = useUser();

  const authStatus = useMemo(() => {
    const isEmailAuthenticated = !!userId && !!user;

    return {
      isAuthenticated: isEmailAuthenticated,
      isEmailAuthenticated,
      isGoogleAuthenticated: false,
      authMethod: isEmailAuthenticated ? ('email' as const) : null,
      isLoading,
    };
  }, [user, userId, isLoading]);

  const displayName = useMemo(() => {
    if (!user) return null;
    return user.full_name || user.email || null;
  }, [user]);

  const firstLetter = useMemo(() => {
    if (!displayName) return '?';
    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  return {
    ...authStatus,
    displayName,
    userId,
    firstLetter,
    user,
  };
};

