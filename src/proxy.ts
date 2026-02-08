import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
	"/login",
	"/sign-up",
	"/forgot-password",
	"/reset-password",
	"/confirm-email",
	"/email-verification",
	"/verify-email",
	"/privacy-policy",
	"/terms-of-service",
	"/error",
	"/clubs",
];

const AUTH_ROUTES = ["/login", "/sign-up", "/forgot-password", "/reset-password"];

/**
 * Next.js 16 Proxy - Lightweight routing layer
 *
 * This proxy only performs optimistic checks based on cookie existence.
 * Actual token validation happens in AuthProvider on the client side.
 *
 * DO NOT add HTTP calls here - it runs on every request and will cause
 * severe performance issues.
 */
export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if route is public (no auth required)
	const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

	// Check if route is an auth route (login, signup, etc.)
	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

	// Get token cookie (existence check only, no validation)
	const hasToken = request.cookies.has("token");

	// If user has token and tries to access auth pages, redirect to dashboard
	if (hasToken && isAuthRoute) {
		return NextResponse.redirect(new URL("/hub", request.url));
	}

	// If route is public, allow access
	if (isPublicRoute) {
		return NextResponse.next();
	}

	// For protected routes, redirect to login if no token cookie
	// The AuthProvider will handle actual token validation on the client
	if (!hasToken) {
		const returnUrl = pathname + request.nextUrl.search;
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callback", returnUrl);

		const response = NextResponse.redirect(loginUrl);
		// Clear potentially stale cookies
		response.cookies.delete("token");
		response.cookies.delete("refreshToken");
		return response;
	}

	// Token exists, allow request to proceed
	// Actual validation happens in AuthProvider
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
	],
};
