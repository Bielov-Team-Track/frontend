// app/api/refresh-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();

  try {
    // Forward refresh token to the API
    const apiResponse = await axios.post(`${process.env.API_BASE_URL}/api/v1/auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken, accessTokenExpiry, refreshTokenExpiry, user } = apiResponse.data;

    // Set new token in HTTP-only cookie for SSR
    const response = NextResponse.json({ 
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiry,
      refreshTokenExpiry,
      user
    });
    
    response.cookies.set({
      name: 'token',
      value: accessToken,
      // httpOnly: true, // Enable in production
      // secure: true, // Enable in production
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes (same as access token)
      path: '/',
    });

    return response;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.response?.data?.error || 'Token refresh failed';

    // Clear cookie on refresh failure
    const response = NextResponse.json({ error: message }, { status });
    response.cookies.delete('token');
    
    return response;
  }
}