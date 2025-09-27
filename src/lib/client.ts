import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
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

const isTokenExpired = (): boolean => {
  if (typeof window === "undefined") return true;
  const expiry = localStorage.getItem("accessTokenExpiry");
  if (!expiry) return true;
  return new Date() >= new Date(expiry);
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      }/api/v1/auth/refresh`,
      refreshToken
    );

    const {
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    } = response.data;

    // Update stored tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("accessTokenExpiry", expiresAt);

    // Update cookie for SSR
    document.cookie = `token=${accessToken}; path=/; max-age=${15 * 60}`;

    return accessToken;
  } catch (error) {
    // Refresh failed, clear all tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiry");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return null;
  }
};

// Request interceptor to add auth token and handle refresh
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      let token = getAccessToken();
      if (token && isTokenExpired()) {
        token = await refreshAccessToken();
      }

      // If we still don't have a token, try cookie fallback
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
  }
);

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle dates and auth errors
client.interceptors.response.use(
  (originalResponse) => {
    handleDates(originalResponse.data);
    return originalResponse;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Clear all tokens and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("accessTokenExpiry");
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    console.error(error.response || error.message);

    return Promise.reject(error);
  }
);

export default client;
