"use client";

import { Loader } from "@/components";
import { getOnboardingLink } from "@/lib/api/payments";
import { use, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const StripeRefreshPage = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState("Refreshing your Stripe session...");

	useEffect(() => {
		// Redirect to the backend endpoint to refresh the Stripe session
		getOnboardingLink()
			.then((onboardingLink: string) => {
				window.location.href = onboardingLink;
			})
			.catch((err) => {
				console.error("Failed to get onboarding link:", err);
				setError("Failed to refresh Stripe session. Please try again.");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<div>
			<div className="flex items-center justify-center gap-4">
				{isLoading && <Loader />}
				{error ? (
					<div className="flex items-center gap-4">
						<AlertTriangle className="text-error" size={36} />
						<span className="text-error">{error}</span>
					</div>
				) : (
					<span>{status}</span>
				)}
			</div>
		</div>
	);
};
export default StripeRefreshPage;
