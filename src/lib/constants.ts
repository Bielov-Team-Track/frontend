// API Base URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || `${API_BASE_URL}auth`;
export const EVENTS_API_URL = process.env.NEXT_PUBLIC_EVENTS_API_URL || `${API_BASE_URL}events`;
export const MESSAGES_API_URL = process.env.NEXT_PUBLIC_MESSAGES_API_URL || `${API_BASE_URL}messages`;
export const PROFILES_API_URL = process.env.NEXT_PUBLIC_PROFILES_API_URL || `${API_BASE_URL}profiles`;
export const CLUBS_API_URL = process.env.NEXT_PUBLIC_CLUBS_API_URL || `${API_BASE_URL}clubs`;
export const NOTIFICATIONS_API_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || `${API_BASE_URL}notifications`;
export const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL || `${API_BASE_URL}payments`;

// WebSocket URL
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://localhost:8000/ws`;

// API Versioning
export const AUTH_API_V1 = `${AUTH_API_URL}/v1`;
export const EVENTS_API_V1 = `${EVENTS_API_URL}/v1`;
export const PROFILES_API_V1 = `${PROFILES_API_URL}/v1`;
export const CLUBS_API_V1 = `${CLUBS_API_URL}/v1`;
export const NOTIFICATIONS_API_V1 = `${NOTIFICATIONS_API_URL}/v1`;
export const PAYMENTS_API_V1 = `${PAYMENTS_API_URL}/v1`;
