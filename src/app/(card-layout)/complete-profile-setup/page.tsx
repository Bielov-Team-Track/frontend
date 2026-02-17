"use client";

import { Button } from "@/components";
import { CompleteProfileSetupForm } from "@/components/features/profile";
import { setCookie } from "@/lib/cookies";
import { useAuth } from "@/providers";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PROFILE_STATUS_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const CompleteProfileSetupPage = () => {
	const router = useRouter();
	const { refreshAuth } = useAuth();

	const handleProfileComplete = async () => {
		try {
			await refreshAuth();
			router.push("/hub");
		} catch {
			// Profile was saved successfully by the form. If refreshAuth fails (transient network error),
			// manually set the cookie so the proxy allows navigation.
			// Use window.location.href to force a full page reload so AuthProvider re-initializes
			// and fetches the now-complete profile. router.push would be client-side and AppShell
			// would see stale isProfileComplete=false, redirecting back to this page.
			setCookie("profileStatus", "complete", PROFILE_STATUS_MAX_AGE);
			window.location.href = "/hub";
		}
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
