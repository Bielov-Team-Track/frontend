// app/api/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Function to handle all HTTP methods
export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request);
}

// ... add other HTTP methods as needed

async function handleProxy(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  // Reconstruct the URL to the backend API
  const { pathname, search } = request.nextUrl;
  const apiPath = pathname.replace(/^\/api\//, '');
  const backendUrl = `${process.env.API_BASE_URL}${apiPath}${search}`;

  // Prepare headers
  const headers: HeadersInit = new Headers();
  request.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  // Set the Authorization header if token is present
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Remove any headers that should not be forwarded
  headers.delete('Host'); // Avoid sending Host header to backend

  // Prepare request options
  const method = request.method;
  const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined;

  const fetchOptions: RequestInit = {
    method,
    headers,
    body,
    redirect: 'manual',
  };

  try {
    // Send the request to the backend API
    const response = await fetch(backendUrl, fetchOptions);

    // Create a new NextResponse with the backend response
    const responseBody = response.body ? response.body : null;

    const res = new NextResponse(responseBody, {
      status: response.status,
      headers: response.headers,
    });

    return res;
  } catch (error) {
    console.error('Error in proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
