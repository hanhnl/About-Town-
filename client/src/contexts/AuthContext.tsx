import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  neighborhood: string | null;
  zipcode: string | null;
  isModerator: boolean | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("abouttown-user-id");
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  // TEMPORARILY DISABLED - Testing frontend without API calls
  const { data: userData, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/users", userId],
    enabled: false, // Disabled temporarily (was: !!userId)
  });

  const user = userData ?? null;

  const login = (newUser: AuthUser) => {
    setUserId(newUser.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("abouttown-user-id", String(newUser.id));
    }
  };

  const logout = () => {
    setUserId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("abouttown-user-id");
    }
  };

  useEffect(() => {
    if (userId && typeof window !== "undefined") {
      localStorage.setItem("abouttown-user-id", String(userId));
    }
  }, [userId]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading: !!userId && isLoading,
        login,
        logout,
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
