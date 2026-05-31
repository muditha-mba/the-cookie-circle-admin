"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { authApi } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from "@/lib/auth/token-storage";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await authApi.me();
      if (currentUser.role !== "ADMIN") {
        clearStoredTokens();
        setUser(null);
        return;
      }
      setUser(currentUser);
    } catch {
      clearStoredTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({
        email,
        password,
        app: "admin",
      });

      if (response.user.role !== "ADMIN") {
        throw new Error("Admin access required");
      }

      setStoredTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });
      setUser(response.user);
      router.replace(routes.dashboard);
    },
    [router],
  );

  const logout = useCallback(async () => {
    const tokens = getStoredTokens();
    if (tokens) {
      try {
        await authApi.logout({ refresh_token: tokens.refreshToken });
      } catch {
        // Clear local session even if API logout fails
      }
    }
    clearStoredTokens();
    setUser(null);
    router.replace(routes.auth.login);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
