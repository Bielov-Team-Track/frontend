// app/api/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  let refreshToken;
  
  try {
    const body = await request.json();
    refreshToken = body.refreshToken;
  } catch {
    // No body or invalid JSON, that's okay
  }

  try {
    // Forward logout request to the API if refresh token is provided
    if (refreshToken) {
      await axios.post(`${process.env.API_BASE_URL}/api/v1/auth/logout`, {
        refreshToken,
      });
    }
  } catch (error) {
    // Even if backend logout fails, we still want to clear client tokens
    console.error('Backend logout failed:', error);
  }

  // Always clear the authentication cookie
  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');

  return response;
}
