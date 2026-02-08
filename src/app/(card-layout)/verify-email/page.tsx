"use client";

import { Button, Loader } from "@/components";
import { verifyEmail } from "@/lib/api/auth";
import { useAuth } from "@/providers";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { Check } from "lucide-react";

const VerifyEmailPageContent = () => {
	const [error, setError] = React.useState<string | null>(null);
	const [countdown, setCountdown] = React.useState(5);
	const router = useRouter();
	const params = useSearchParams();
	const token = params.get("token");
	const { loginFromTokens } = useAuth();

	const verifiedRef = React.useRef(false);

	useEffect(() => {
		if (verifiedRef.current) return;

		if (!token) {
			setError("Invalid verification link");
			return;
		}

		verifyEmail(token)
			.then(async (result) => {
				if (!result.success) {
					// Handle verification failure
					if (result.errorType === "TokenNotFound") {
						setError("This verification link is invalid or not found");
					} else if (result.errorType === "TokenExpired") {
						setError("This verification link has expired");
					} else {
						setError(
							result.errorMessage ||
								"An error occurred while verifying your email",
						);
					}
					return;
				}

				// Verification successful
				verifiedRef.current = true;
				setError(null);

				// If auth tokens are provided, log in the user automatically
				if (result.auth) {
					try {
						await loginFromTokens(result.auth);
					} catch (loginError) {
						console.error(
							"Failed to log in user after verification:",
							loginError,
						);
						// Continue with redirect even if login fails
					}
				}

				const timer = setInterval(() => {
					setCountdown((prev) => {
						if (prev <= 1) {
							clearInterval(timer);
							router.push("/hub/events/my");
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
			})
			.catch((errorResponse) => {
				console.error("Email verification error:", errorResponse);
				setError("An error occurred while verifying your email");
			});

		setError(null);
	}, [router, token, loginFromTokens]);

	// Countdown timer effect

	return (
		<>
			{" "}
			{error ? (
				<div className="text-red-500 text-center">{error}</div>
			) : !verifiedRef.current ? (
				<>
					<div className="flex items-center justify-center">
						<Loader size="24px" className="inline-block mr-2" />
						<h2>Verifing you email...</h2>
					</div>
					<p>
						We are verifying your email address. This may take a few moments.
					</p>
				</>
			) : (
				<>
					<div className="flex items-center justify-center gap-2">
						<Check size={24} />
						<h2 className="">Your email is verified!</h2>
					</div>
					<p>
						You will be redirected to your dashboard in{" "}
						<span className="font-bold text-accent">{countdown}</span> seconds
					</p>
					<Button
						variant="link"
						onClick={() => router.push("/hub/events/my")}
					>
						go to dashboard straight away
					</Button>
				</>
			)}
		</>
	);
};

const VerifyEmailPage = () => {
	return (
		<Suspense fallback={<Loader />}>
			<VerifyEmailPageContent />
		</Suspense>
	);
};

export default VerifyEmailPage;
