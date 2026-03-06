"use client";

import { Button } from "@/components";
import { CompleteProfileSetupForm } from "@/components/features/profile";
import { setCookie } from "@/lib/cookies";
import { useAuth } from "@/providers";
import Link from "next/link";

const PROFILE_STATUS_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const CompleteProfileSetupPage = () => {
	const { refreshAuth } = useAuth();

	const handleProfileComplete = async () => {
		try {
			await refreshAuth();
		} catch {
			// If refreshAuth fails (transient network error), set cookie as fallback
			setCookie("profileStatus", "complete", PROFILE_STATUS_MAX_AGE);
		}
		// Always use hard navigation. router.push causes a race condition:
		// refreshAuth's setUserProfile queues a React state update that hasn't
		// committed yet, so AppShell reads stale isProfileComplete=false and
		// redirects back to this page.
		window.location.href = "/hub";
	};

	return (
		<>
			<h1 className="text-3xl font-bold text-foreground text-center mb-2">Welcome to Spike! 🎉</h1>
			<p className="text-muted text-center">Let's get your profile set up so you can start playing.</p>
			<p className="text-muted text-center mb-8">
				Wrong profile? Go back to{" "}
				<Button asChild variant={"link"}>
					<Link href="/login">login page</Link>
				</Button>
			</p>
			<CompleteProfileSetupForm onProfileComplete={handleProfileComplete} />
		</>
	);
};

export default CompleteProfileSetupPage;
