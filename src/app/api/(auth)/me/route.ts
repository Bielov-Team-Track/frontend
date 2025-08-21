// app/api/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    // Forward request to the API
    const apiResponse = await axios.get(`${process.env.API_BASE_URL}/api/v1/profiles/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json(apiResponse.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.response?.data?.error || 'Failed to get user information';

    return NextResponse.json({ error: message }, { status });
  }
}
