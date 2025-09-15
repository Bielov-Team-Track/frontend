"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthResponse,
  login as apiLogin,
  refreshToken as apiRefreshToken,
  logout as apiLogout,
  getCurrentUserProfile,
} from "../requests/auth";
import { UserProfile } from "../models/User";
import { redirect } from "next/navigation";

interface AuthContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
const TOKEN_EXPIRY_STORAGE_KEY = "accessTokenExpiry";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!userProfile;

  // Token management utilities
  const saveTokens = (authResponse: AuthResponse) => {
    console.log("Saving tokens:", {
      token: authResponse.token.substring(0, 20) + "...",
      expiry: authResponse.expiresAt,
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authResponse.refreshToken);
    localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, authResponse.expiresAt);

    // Also set in cookie for SSR
    const cookieValue = `token=${authResponse.token}; path=/; max-age=${
      15 * 60
    }; SameSite=Lax`;
    document.cookie = cookieValue;
    console.log("Cookie set:", cookieValue.substring(0, 50) + "...");
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);

    // Clear cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const getStoredAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  };

  const getStoredRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  };

  const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
    if (!expiry) return true;

    return new Date() >= new Date(expiry);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const user = await apiLogin(email, password);

      saveTokens(user);
    } catch (error) {
      console.error("Login failed:", error);
      clearTokens();
      setUserProfile(null);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshTokenValue = getStoredRefreshToken();
      if (refreshTokenValue) {
        await apiLogout(refreshTokenValue);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      setUserProfile(null);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshTokenValue = getStoredRefreshToken();

      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const authResponse = await apiRefreshToken(refreshTokenValue);

      saveTokens(authResponse);
      const userProfile = await getCurrentUserProfile();
      setUserProfile(userProfile ?? null);
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearTokens();
      setUserProfile(null);

      // Redirect to login on refresh failure
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getStoredAccessToken();
        const refreshTokenValue = getStoredRefreshToken();

        if (!accessToken || !refreshTokenValue) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (isTokenExpired()) {
          // Try to refresh
          await refreshAuth();
        } else {
          // Token is valid, get current user
          try {
            const currentUserProfile = await getCurrentUserProfile();
            setUserProfile(currentUserProfile ?? null);
          } catch (error) {
            // If getting user fails, try refresh
            await refreshAuth();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        clearTokens();
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    userProfile,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Utility hook for getting access token
export function useAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
