"use client";

import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { UserProfile } from "@/lib/models/User";
import {
	AuthResponse,
	login as apiLogin,
	logout as apiLogout,
	refreshToken as apiRefreshToken,
	getCurrentUserProfile,
} from "@/lib/api/auth";

interface AuthContextType {
	userProfile: UserProfile | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	loginFromTokens: (authResponse: AuthResponse) => Promise<void>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie utility functions
const getCookie = (name: string): string | null => {
	if (typeof window === "undefined") return null;
	const row = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${name}=`));
	if (!row) return null;
	// Use slice(1).join("=") to handle values containing "=" characters (like JWT tokens)
	return row.split("=").slice(1).join("=") || null;
};

const setCookie = (name: string, value: string, maxAge: number): void => {
	if (typeof window === "undefined") return;
	document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const deleteCookie = (name: string): void => {
	if (typeof window === "undefined") return;
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Parse JWT to get expiration time
const getTokenExpiration = (token: string): Date | null => {
	try {
		const payload = token.split(".")[1];
		const decoded = JSON.parse(atob(payload));
		if (decoded.exp) {
			return new Date(decoded.exp * 1000);
		}
		return null;
	} catch {
		return null;
	}
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

	const isAuthenticated = !!userProfile;

	// Token management utilities (cookies only)
	const saveTokens = useCallback((authResponse: AuthResponse) => {
		console.log("Saving tokens:", {
			token: authResponse.token.substring(0, 20) + "...",
			expiry: authResponse.expiresAt,
		});

		// Calculate token expiration time
		const expiresAt = new Date(authResponse.expiresAt);
		const now = new Date();
		const timeUntilExpiry = expiresAt.getTime() - now.getTime();

		// Set access token cookie
		// Subtract 60s from maxAge to ensure cookie expires before token (preventing race conditions)
		const maxAge = Math.max(0, Math.floor(timeUntilExpiry / 1000) - 60);
		setCookie("token", authResponse.token, maxAge);
		console.log("Access token cookie set with max-age:", maxAge, "seconds");

		// Set refresh token cookie (7 days)
		const refreshTokenMaxAge = 7 * 24 * 60 * 60;
		setCookie("refreshToken", authResponse.refreshToken, refreshTokenMaxAge);
		console.log("Refresh token cookie set with max-age:", refreshTokenMaxAge, "seconds");

		// Schedule proactive token refresh (60 seconds before expiry)
		const refreshBuffer = 60000; // 60 seconds buffer
		const refreshIn = Math.max(0, timeUntilExpiry - refreshBuffer);

		console.log(`Scheduling token refresh in ${refreshIn}ms (${refreshIn / 1000}s)`);

		// Clear any existing timer
		if (refreshTimerRef.current) {
			clearTimeout(refreshTimerRef.current);
		}

		// Set new timer for proactive refresh
		refreshTimerRef.current = setTimeout(() => {
			console.log("Proactive token refresh triggered");
			refreshAuth();
		}, refreshIn);
	}, []);

	const clearTokens = useCallback(() => {
		deleteCookie("token");
		deleteCookie("refreshToken");

		// Clear refresh timer
		if (refreshTimerRef.current) {
			clearTimeout(refreshTimerRef.current);
			refreshTimerRef.current = null;
		}
	}, []);

	const getStoredAccessToken = (): string | null => {
		return getCookie("token");
	};

	const getStoredRefreshToken = (): string | null => {
		return getCookie("refreshToken");
	};

	const isTokenExpired = (): boolean => {
		const token = getStoredAccessToken();
		if (!token) return true;

		const expiration = getTokenExpiration(token);
		if (!expiration) return true;

		return new Date() >= expiration;
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

	const loginFromTokens = async (authResponse: AuthResponse): Promise<void> => {
		try {
			saveTokens(authResponse);
			const profile = await getCurrentUserProfile();
			setUserProfile(profile ?? null);
		} catch (error) {
			console.error("Login from tokens failed:", error);
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

	const refreshAuth = useCallback(async (): Promise<void> => {
		try {
			const refreshTokenValue = getStoredRefreshToken();

			if (!refreshTokenValue) {
				throw new Error("No refresh token available");
			}

			const authResponse = await apiRefreshToken(refreshTokenValue);

			saveTokens(authResponse);
			const profile = await getCurrentUserProfile();
			setUserProfile(profile ?? null);
		} catch (error) {
			console.error("Token refresh failed:", error);
			console.error(
				"Full error details:",
				JSON.stringify(error, Object.getOwnPropertyNames(error))
			);
			clearTokens();
			setUserProfile(null);

			// Redirect to login on refresh failure
			if (typeof window !== "undefined") {
				console.log("Redirecting to login page");
				window.location.href = "/login";
			}
		}
	}, [saveTokens, clearTokens]);

	// Initialize authentication state
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const accessToken = getStoredAccessToken();
				const refreshTokenValue = getStoredRefreshToken();

				if (!accessToken && !refreshTokenValue) {
					setIsLoading(false);
					return;
				}

				// If we have a refresh token but no access token, try to refresh
				if (!accessToken && refreshTokenValue) {
					await refreshAuth();
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
	}, [refreshAuth, clearTokens]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (refreshTimerRef.current) {
				clearTimeout(refreshTimerRef.current);
			}
		};
	}, []);

	const value: AuthContextType = {
		userProfile,
		isLoading,
		isAuthenticated,
		login,
		loginFromTokens,
		logout,
		refreshAuth,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// Utility hook for getting access token from cookies
export function useAccessToken(): string | null {
	if (typeof window === "undefined") return null;
	return getCookie("token");
}
