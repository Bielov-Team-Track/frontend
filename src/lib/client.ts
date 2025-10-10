import axios, { InternalAxiosRequestConfig } from "axios";
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

// Response interceptor to handle dates
client.interceptors.response.use(
	(originalResponse) => {
		handleDates(originalResponse.data);
		return originalResponse;
	},
	async (error) => {
		console.error(error.response || error.message);
		return Promise.reject(error);
	},
);

export default client;
