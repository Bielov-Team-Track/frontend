// app/api/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  try {
    // Forward credentials to the API
    const apiResponse = await axios.post(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
      email,
      password,
    });

    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry, user } = apiResponse.data;

    // Set token in HTTP-only cookie for SSR (short-lived)
    const response = NextResponse.json({ 
      accessToken,
      refreshToken,
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
    const message = error.response?.data?.message || error.response?.data?.error || 'Authentication failed';

    return NextResponse.json({ error: message }, { status });
  }
}
