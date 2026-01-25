import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

// Auth user type (supports both local and Clerk auth)
export interface AuthUser {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  neighborhood: string | null;
  zipcode: string | null;
  isModerator: boolean | null;
  imageUrl?: string | null;
  authProvider: 'local' | 'clerk';
}

interface ClerkConfig {
  publishableKey: string | null;
  configured: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isClerkConfigured: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  signInWithClerk: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Local auth state (fallback when Clerk is not configured)
  const [localUserId, setLocalUserId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("abouttown-user-id");
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  // Clerk auth state
  const [clerkUser, setClerkUser] = useState<AuthUser | null>(null);

  // Fetch Clerk config to check if it's enabled
  const { data: clerkConfig } = useQuery<ClerkConfig>({
    queryKey: ["/api/auth/config"],
    staleTime: Infinity,
  });

  // Fetch Clerk auth status
  const { data: authStatus, isLoading: clerkLoading } = useQuery<{
    configured: boolean;
    authenticated: boolean;
    userId: string | null;
    user: {
      id: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    } | null;
  }>({
    queryKey: ["/api/auth/status"],
    enabled: clerkConfig?.configured ?? false,
    refetchInterval: 60000, // Check every minute
  });

  // Fetch local user data (fallback)
  const { data: localUserData, isLoading: localLoading } = useQuery<AuthUser>({
    queryKey: ["/api/users", localUserId],
    enabled: !!localUserId && !clerkConfig?.configured,
  });

  // Update Clerk user when auth status changes
  useEffect(() => {
    if (authStatus?.authenticated && authStatus.user) {
      setClerkUser({
        id: authStatus.user.id,
        firstName: authStatus.user.firstName,
        lastName: authStatus.user.lastName,
        email: authStatus.user.email,
        neighborhood: null,
        zipcode: null,
        isModerator: false,
        imageUrl: authStatus.user.imageUrl,
        authProvider: 'clerk',
      });
    } else if (authStatus && !authStatus.authenticated) {
      setClerkUser(null);
    }
  }, [authStatus]);

  // Determine which user to use
  const isClerkConfigured = clerkConfig?.configured ?? false;
  const user = isClerkConfigured
    ? clerkUser
    : localUserData
      ? { ...localUserData, authProvider: 'local' as const }
      : null;

  const isLoading = isClerkConfigured ? clerkLoading : (!!localUserId && localLoading);

  // Login function (for local auth)
  const login = (newUser: AuthUser) => {
    if (newUser.authProvider === 'clerk') {
      setClerkUser(newUser);
    } else {
      setLocalUserId(typeof newUser.id === 'number' ? newUser.id : parseInt(String(newUser.id), 10));
      if (typeof window !== "undefined") {
        localStorage.setItem("abouttown-user-id", String(newUser.id));
      }
    }
  };

  // Logout function
  const logout = () => {
    if (isClerkConfigured) {
      // For Clerk, redirect to sign-out
      setClerkUser(null);
      // The frontend would need to call Clerk's signOut method
      window.location.href = '/';
    } else {
      setLocalUserId(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("abouttown-user-id");
      }
    }
  };

  // Sign in with Clerk (opens Clerk modal)
  const signInWithClerk = () => {
    if (isClerkConfigured && clerkConfig?.publishableKey) {
      // This would be handled by the Clerk frontend SDK
      // For now, we'll just log a message
      console.log('Clerk sign-in requested. Publishable key:', clerkConfig.publishableKey);
      // In a full implementation, you would:
      // 1. Import { useClerk } from '@clerk/clerk-react'
      // 2. Call openSignIn() method
    }
  };

  // Persist local user ID
  useEffect(() => {
    if (localUserId && typeof window !== "undefined" && !isClerkConfigured) {
      localStorage.setItem("abouttown-user-id", String(localUserId));
    }
  }, [localUserId, isClerkConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        isClerkConfigured,
        login,
        logout,
        signInWithClerk,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
