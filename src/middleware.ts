import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
  "/email-verification",
  "/privacy-policy",
  "/terms-of-service",
  "/_next",
  "/api",
  "/favicon.ico",
  "/events",
];

export default async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware - checking path:", pathname);

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === "/"
  );

  if (isPublicRoute) {
    console.log("Middleware - public route, allowing");
    return NextResponse.next();
  }

  // Check for authentication token in cookies
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  console.log(
    "Middleware - token found:",
    !!token,
    token ? token.substring(0, 20) + "..." : "none"
  );

  if (!token) {
    // No token found, redirect to login
    console.log("Middleware - no token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token using the new auth endpoint
  try {
    console.log("Middleware - verifying token with backend");
    const response = await fetch(`${process.env.API_BASE_URL}auth/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Middleware - verify token response status:", response.status);

    if (!response.ok) {
      // Token is invalid, redirect to login
      console.log("Middleware - token invalid, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);

      // Clear invalid token
      redirectResponse.cookies.delete("token");
      return redirectResponse;
    }

    const result = await response.json();
    console.log("Middleware - verify token result:", result);

    if (!result.isValid) {
      // Token is not valid, redirect to login
      console.log("Middleware - token not valid, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);

      // Clear invalid token
      redirectResponse.cookies.delete("token");
      return redirectResponse;
    }

    // User is authenticated, continue
    console.log("Middleware - token valid, allowing access");
    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // On error, redirect to login and clear token
    const loginUrl = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete("token");
    return redirectResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (webpack hot module reload)
     * - favicon.ico (favicon file)
     * - static assets (css, js, images, etc.)
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
