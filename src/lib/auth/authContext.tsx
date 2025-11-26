"use client";

import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { UserProfile } from "../models/User";
import {
	AuthResponse,
	login as apiLogin,
	logout as apiLogout,
	refreshToken as apiRefreshToken,
	getCurrentUserProfile,
} from "../requests/auth";

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

const TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
const TOKEN_EXPIRY_STORAGE_KEY = "accessTokenExpiry";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshTimerId, setRefreshTimerId] = useState<NodeJS.Timeout | null>(
		null
	);

	const isAuthenticated = !!userProfile;

	// Token management utilities
	const saveTokens = (authResponse: AuthResponse) => {
		console.log("Saving tokens:", {
			token: authResponse.token.substring(0, 20) + "...",
			expiry: authResponse.expiresAt,
		});
		localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
		localStorage.setItem(
			REFRESH_TOKEN_STORAGE_KEY,
			authResponse.refreshToken
		);
		localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, authResponse.expiresAt);

		// Calculate token expiration time
		const expiresAt = new Date(authResponse.expiresAt);
		const now = new Date();
		const timeUntilExpiry = expiresAt.getTime() - now.getTime();

		// Set access token cookie to expire at the same time as the token
		const maxAge = Math.max(0, Math.floor(timeUntilExpiry / 1000));
		const tokenCookie = `token=${authResponse.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
		document.cookie = tokenCookie;
		console.log("Access token cookie set with max-age:", maxAge, "seconds");

		// Set refresh token cookie (with longer expiration, e.g., 7 days)
		const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds
		const refreshTokenCookie = `refreshToken=${authResponse.refreshToken}; path=/; max-age=${refreshTokenMaxAge}; SameSite=Lax`;
		document.cookie = refreshTokenCookie;
		console.log(
			"Refresh token cookie set with max-age:",
			refreshTokenMaxAge,
			"seconds"
		);

		// Schedule proactive token refresh (5 seconds before expiry)
		const refreshBuffer = 5000; // 5 seconds buffer
		const refreshIn = Math.max(0, timeUntilExpiry - refreshBuffer);

		console.log(
			`Scheduling token refresh in ${refreshIn}ms (${refreshIn / 1000}s)`
		);

		// Clear any existing timer
		if (refreshTimerId) {
			clearTimeout(refreshTimerId);
		}

		// Set new timer for proactive refresh
		const timerId = setTimeout(() => {
			console.log("Proactive token refresh triggered");
			refreshAuth();
		}, refreshIn);

		setRefreshTimerId(timerId);
	};

	const clearTokens = () => {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
		localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);

		// Clear cookies
		document.cookie =
			"token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie =
			"refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

		// Clear refresh timer
		if (refreshTimerId) {
			clearTimeout(refreshTimerId);
			setRefreshTimerId(null);
		}
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

	const loginFromTokens = async (
		authResponse: AuthResponse
	): Promise<void> => {
		try {
			saveTokens(authResponse);
			const userProfile = await getCurrentUserProfile();
			setUserProfile(userProfile ?? null);
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
			const userProfile = await getCurrentUserProfile();
			setUserProfile(userProfile ?? null);
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
				console.log("Redirecting to login page1");
				window.location.href = "/login";
			}
		}
	}, []);

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
						const currentUserProfile =
							await getCurrentUserProfile();
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
	}, [refreshAuth]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (refreshTimerId) {
				clearTimeout(refreshTimerId);
			}
		};
	}, [refreshTimerId]);

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

// Utility hook for getting access token
export function useAccessToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_STORAGE_KEY);
}
