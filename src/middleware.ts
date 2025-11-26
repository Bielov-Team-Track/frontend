import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_V1, PROFILES_API_V1 } from "./lib/constants";

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
];

const PROFILE_SETUP_ROUTE = "/complete-profile-setup";

// Cookie options - Centralized to ensure consistency
const COOKIE_OPTIONS = {
	path: "/",
	sameSite: "lax" as const,
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
};

// Helper: Refresh Token
async function refreshAccessToken(refreshToken: string) {
	try {
		const response = await fetch(`${AUTH_API_V1}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) return null;
		return await response.json(); // { token, refreshToken }
	} catch (error) {
		return null;
	}
}

// Helper: Validate Token
async function validateToken(token: string) {
	try {
		const response = await fetch(`${AUTH_API_V1}/auth/validate`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export default async function authMiddleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1. Bypass Public Routes
	if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// 2. Get Tokens
	const token = request.cookies.get("token")?.value;
	const refreshToken = request.cookies.get("refreshToken")?.value;

	let accessToken = token;
	let newTokens = null;
	let tokenWasRefreshed = false;

	// 3. Initial Token Check & Refresh
	// If we have no access token but have a refresh token, OR if we assume it might be expired
	if (!accessToken && refreshToken) {
		newTokens = await refreshAccessToken(refreshToken);
		if (newTokens) {
			accessToken = newTokens.token;
			tokenWasRefreshed = true;
		}
	}

	// 4. Validate Access Token (Existing or Refreshed)
	let validation = accessToken ? await validateToken(accessToken) : null;

	// 5. Secondary Refresh (If token existed but was invalid/expired)
	if (!validation?.isValid && refreshToken && !tokenWasRefreshed) {
		console.log("Middleware - Token invalid, attempting refresh...");
		newTokens = await refreshAccessToken(refreshToken);
		if (newTokens) {
			accessToken = newTokens.token;
			tokenWasRefreshed = true;
			validation = await validateToken(accessToken);
		}
	}

	// 6. Final Authentication Check
	if (!validation?.isValid) {
		// If validation fails after all attempts, redirect to login
		// We strictly clear cookies here to prevent loop issues
		const response = NextResponse.redirect(new URL("/login", request.url));
		response.cookies.delete("token");
		response.cookies.delete("refreshToken");
		return response;
	}

	// =========================================================================
	// CRITICAL SECTION: HANDLING REQUEST MUTATION
	// =========================================================================

	// If we refreshed the token, we MUST update the request headers/cookies
	// so that Server Components (or the downstream API) see the NEW token immediately.
	if (tokenWasRefreshed && accessToken) {
		request.cookies.set("token", accessToken);
		request.cookies.set("refreshToken", newTokens.refreshToken);
		request.headers.set("Authorization", `Bearer ${accessToken}`);
	}

	// 7. Check Profile Completeness
	let response: NextResponse;
	const isProfileSetupRoute = pathname.startsWith(PROFILE_SETUP_ROUTE);

	// Use the (potentially new) accessToken for the profile check
	const profileResponse = await fetch(`${PROFILES_API_V1}/profiles/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (profileResponse.ok) {
		const profile = await profileResponse.json();
		const isProfileComplete = profile.name && profile.surname;

		if (!isProfileComplete && !isProfileSetupRoute) {
			response = NextResponse.redirect(
				new URL(PROFILE_SETUP_ROUTE, request.url)
			);
		} else {
			// Pass the updated request headers to next()
			response = NextResponse.next({
				request: {
					headers: request.headers,
				},
			});
		}
	} else {
		// If profile fetch fails but auth is valid, usually allow or show error
		// Here we allow, or you could redirect to an error page
		response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}

	// 8. Email Verification Redirect
	if (!validation.isEmailVerified && pathname !== "/verify-email") {
		response = NextResponse.redirect(
			new URL("/email-verification", request.url)
		);
	}

	// =========================================================================
	// CRITICAL SECTION: SETTING COOKIES ON FINAL RESPONSE
	// =========================================================================

	// If we refreshed the token, we MUST apply the Set-Cookie header to the
	// FINAL response object (whether it's a redirect or a next()).
	if (tokenWasRefreshed && newTokens) {
		console.log("Middleware - Setting new cookies on response");
		response.cookies.set("token", newTokens.token, COOKIE_OPTIONS);
		response.cookies.set(
			"refreshToken",
			newTokens.refreshToken,
			COOKIE_OPTIONS
		);
	}

	return response;
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
	],
};
