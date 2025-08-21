// app/api/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    // Forward token verification to the API
    const apiResponse = await axios.post(`${process.env.API_BASE_URL}/api/v1/auth/verify-token`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json(apiResponse.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.response?.data?.error || 'Token verification failed';

    return NextResponse.json({ error: message }, { status });
  }
}