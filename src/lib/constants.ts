// API Base URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.volleyer.app/'
export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || `${API_BASE_URL}/auth`
export const EVENTS_API_URL = process.env.NEXT_PUBLIC_EVENTS_API_URL || `${API_BASE_URL}/events`

// WebSocket URL
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://localhost:8000/ws`

// API Versioning
export const AUTH_API_V1 = `${AUTH_API_URL}/v1`
export const EVENTS_API_V1 = `${EVENTS_API_URL}/v1`