import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { handleDates } from "./utils/date";
import { API_BASE_URL } from "./constants";

const client = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
	timeout: 10000,
});

// Token management utilities
const getAccessToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("accessToken");
};

const getRefreshToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("refreshToken");
};

const setAccessToken = (token: string, expiresAt: string): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem("accessToken", token);
	localStorage.setItem("accessTokenExpiry", expiresAt);

	// Update cookie as well
	document.cookie = `token=${token}; path=/; SameSite=Lax`;
};

const setRefreshToken = (token: string): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem("refreshToken", token);
};

const clearTokens = (): void => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("accessTokenExpiry");
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// Refresh token state management
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
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
			let token = getAccessToken();

			// If we don't have a token in localStorage, try cookie fallback
			if (!token) {
				token =
					document.cookie
						.split("; ")
						.find((row) => row.startsWith("token="))
						?.split("=")[1] ?? null;
			}

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
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
		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry &&
			typeof window !== "undefined"
		) {
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
				console.log("No refresh token available, redirecting to login");
				clearTokens();
				window.location.href = "/login";
				return Promise.reject(error);
			}

			try {
				// Call refresh token endpoint
				const response = await axios.post(
					`${API_BASE_URL}/auth/v1/auth/refresh`,
					{
						refreshToken: refreshToken,
					}
				);

				const { token, refreshToken: newRefreshToken, expiresAt } = response.data;

				// Save new tokens
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
				processQueue(refreshError, null);
				clearTokens();
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		console.error(error.response || error.message);
		return Promise.reject(error);
	},
);

export default client;
