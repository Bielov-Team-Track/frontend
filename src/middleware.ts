import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_API_V1, EVENTS_API_V1 } from "./lib/constants";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
  "/email-verification",
  "/verify-email",
  "/privacy-policy",
  "/terms-of-service",
  "/_next",
  "/api",
  "/favicon.ico",
  "/events",
  "/.well-known"
];

// Routes that require authentication but not complete profile
const profileSetupRoute = "/complete-profile-setup";

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

  // Check if it's a profile setup route
  const isProfileSetupRoute = pathname.startsWith(profileSetupRoute);

  // Check for authentication token in cookies
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    console.log("Middleware - no token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("Middleware - token found, validating");

  // Verify token using the new auth endpoint
  try {
    //TODO: change to request from lib/client.ts
    const response = await fetch(`${AUTH_API_V1}/auth/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);

      redirectResponse.cookies.delete("token");
      return redirectResponse;
    }
    const result = await response.json();

    if (!result.isValid) {
      console.log("Middleware - token invalid, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);

      redirectResponse.cookies.delete("token");
      return redirectResponse;
    }

    console.log(
      "Middleware - token valid, email verified:",
      result.isEmailVerified
    );

    if (!result.isEmailVerified && pathname !== "/verify-email") {
      console.log(
        "Middleware - email not verified, redirecting to verification-sent"
      );
      const emailVerificationUrl = new URL("/email-verification", request.url);
      return NextResponse.redirect(emailVerificationUrl);
    }

    // Check profile completeness for non-setup routes
    if (!isProfileSetupRoute) {
      console.log("Middleware - checking profile completeness");
      try {
        const profileResponse = await fetch(`${EVENTS_API_V1}/profiles/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          console.log("Middleware - profile data:", profile);

          // Check if profile is complete (has name and surname)
          const isProfileComplete = profile.name && profile.surname;

          if (!isProfileComplete) {
            console.log(
              "Middleware - profile incomplete, redirecting to profile setup"
            );
            const profileSetupUrl = new URL(profileSetupRoute, request.url);
            console.log("Redirecting to:", profileSetupUrl.toString());
            return NextResponse.redirect(profileSetupUrl);
          }
        } else {
          console.log(
            "Middleware - failed to fetch profile, status:",
            profileResponse.status
          );
          const profileSetupUrl = new URL(profileSetupRoute, request.url);
          return NextResponse.redirect(profileSetupUrl);
        }
      } catch (profileError) {
        console.log("Middleware - profile check error:", profileError);
        const profileSetupUrl = new URL(profileSetupRoute, request.url);
        return NextResponse.redirect(profileSetupUrl);
      }
    }

    // User is authenticated, email verified, and profile complete (or on setup route)
    console.log("Middleware - all checks passed, allowing access");
    return NextResponse.next();
  } catch (error) {
    console.log("Auth middleware error:", error);
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
