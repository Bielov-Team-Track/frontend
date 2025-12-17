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

	// 2. Get Access Token from cookie
	const accessToken = request.cookies.get("token")?.value;

	// 3. No token - redirect to login
	// The client-side axios interceptor will handle token refresh
	if (!accessToken) {
		console.log("Middleware - No access token, redirecting to login");
		const response = NextResponse.redirect(new URL("/login", request.url));
		response.cookies.delete("token");
		response.cookies.delete("refreshToken");
		return response;
	}

	// 4. Validate Access Token
	const validation = await validateToken(accessToken);

	// 5. Invalid token - redirect to login
	// The client-side will attempt refresh on the login page or via axios interceptor
	if (!validation?.isValid) {
		console.log("Middleware - Token invalid, redirecting to login");
		const response = NextResponse.redirect(new URL("/login", request.url));
		response.cookies.delete("token");
		response.cookies.delete("refreshToken");
		return response;
	}

	// 6. Check Email Verification
	if (!validation.isEmailVerified && pathname !== "/verify-email") {
		return NextResponse.redirect(new URL("/email-verification", request.url));
	}

	// 7. Check Profile Completeness
	const isProfileSetupRoute = pathname.startsWith(PROFILE_SETUP_ROUTE);

	const profileResponse = await fetch(`${PROFILES_API_V1}/profiles/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (profileResponse.ok) {
		const responseText = await profileResponse.text();
		let profile;
		try {
			profile = JSON.parse(responseText);
		} catch (e) {
			console.error("Middleware - Failed to parse profile response as JSON");
			profile = {};
		}

		const isProfileComplete = profile.name && profile.surname;

		if (!isProfileComplete && !isProfileSetupRoute) {
			return NextResponse.redirect(new URL(PROFILE_SETUP_ROUTE, request.url));
		}
	}

	// 8. Allow request to proceed
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)",
	],
};
