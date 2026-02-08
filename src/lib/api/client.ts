import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants";
import { handleDates } from "../utils/date";

const client = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
	timeout: 10000,
});

// Cookie utility functions
const getCookie = (name: string): string | null => {
	if (typeof window === "undefined") return null;
	const cookies = document.cookie.split("; ");
	const cookie = cookies.find((row) => row.startsWith(`${name}=`));
	if (!cookie) return null;
	// Use substring to get everything after the first "=" to avoid truncation on "=" chars in Base64
	const value = cookie.substring(name.length + 1);
	return value ? decodeURIComponent(value) : null;
};

const setCookie = (name: string, value: string, maxAge: number): void => {
	if (typeof window === "undefined") return;
	// Encode the value to handle special characters in Base64 tokens (+, /, =)
	// Use Secure flag in production (HTTPS), SameSite=Lax for cross-origin redirects
	const isSecure = window.location.protocol === "https:";
	const secureFlag = isSecure ? "; Secure" : "";
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
};

const deleteCookie = (name: string): void => {
	if (typeof window === "undefined") return;
	const isSecure = window.location.protocol === "https:";
	const secureFlag = isSecure ? "; Secure" : "";
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${secureFlag}`;
};

// Token management utilities (cookies only)
const getAccessToken = (): string | null => {
	return getCookie("token");
};

const getRefreshToken = (): string | null => {
	return getCookie("refreshToken");
};

const setAccessToken = (token: string, expiresAt: string): void => {
	if (typeof window === "undefined") return;

	// Calculate max-age from expiresAt
	const expires = new Date(expiresAt);
	const now = new Date();
	// 60s buffer to expire cookie before token
	const maxAge = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000) - 60);

	setCookie("token", token, maxAge);
};

const setRefreshToken = (token: string): void => {
	if (typeof window === "undefined") return;
	// Refresh token valid for 7 days
	const refreshTokenMaxAge = 7 * 24 * 60 * 60;
	setCookie("refreshToken", token, refreshTokenMaxAge);
};

const clearTokens = (): void => {
	if (typeof window === "undefined") return;
	deleteCookie("token");
	deleteCookie("refreshToken");
};

// Refresh token state management
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: string | null) => void;
	reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null = null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

// Request interceptor to add auth token
client.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		if (typeof window !== "undefined") {
			const token = getAccessToken();

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			// If acting as a minor (guardian feature), include the X-Acting-As header
			const { useFamilyStore } = await import("../realtime/familyStore");
			const actingAsUserId = useFamilyStore.getState().actingAsUserId;
			if (actingAsUserId) {
				config.headers["X-Acting-As"] = actingAsUserId;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle dates and token refresh
client.interceptors.response.use(
	(originalResponse) => {
		handleDates(originalResponse.data);
		return originalResponse;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Check if error is 401 and we haven't retried yet
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry && typeof window !== "undefined") {
			// Skip refresh for login, register, and refresh endpoints
			const skipRefreshUrls = ["/auth/v1/auth/login", "/auth/v1/auth/register", "/auth/v1/auth/refresh"];
			if (skipRefreshUrls.some((url) => originalRequest.url?.includes(url))) {
				return Promise.reject(error);
			}

			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return client(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = getRefreshToken();

			if (!refreshToken) {
				clearTokens();
				const returnUrl = window.location.pathname + window.location.search;
				window.location.href = `/login?callback=${encodeURIComponent(returnUrl)}`;
				return Promise.reject(error);
			}

			try {
				// Call refresh token endpoint
				const response = await axios.post(`${API_BASE_URL}/auth/v1/auth/refresh`, {
					refreshToken: refreshToken,
				});

				const { token, refreshToken: newRefreshToken, expiresAt } = response.data;

				// Save new tokens to cookies
				setAccessToken(token, expiresAt);
				setRefreshToken(newRefreshToken);

				// Update authorization header
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${token}`;
				}

				// Process queued requests
				processQueue(null, token);

				// Retry original request
				return client(originalRequest);
			} catch (refreshError) {
				console.error("Token refresh failed:", refreshError);
				const error = refreshError instanceof Error ? refreshError : new Error("Token refresh failed");
				processQueue(error, null);
				clearTokens();
				const returnUrl = window.location.pathname + window.location.search;
				window.location.href = `/login?callback=${encodeURIComponent(returnUrl)}`;
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		console.error(error.response || error.message);
		return Promise.reject(error);
	}
);

export default client;
