"use client";

import { CompleteProfileSetupForm } from "@/components/features/profile";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CompleteProfileSetupPage = () => {
	const router = useRouter();

	const handleProfileComplete = () => {
		// Redirect to the main application page or dashboard after profile completion
		router.push("/dashboard");
	};

	return (
		<>
			<h1 className="text-3xl font-bold text-white text-center mb-2">
				Welcome to Volleyer! 🎉
			</h1>
			<p className="text-muted text-center">
				Let's get your profile set up so you can start playing.
			</p>
			<p className="text-muted text-center mb-8">
				Wrong profile? Go back to{" "}
				<Link className="link" href="/login">
					login page
				</Link>
			</p>
			<CompleteProfileSetupForm
				onProfileComplete={handleProfileComplete}
			/>
		</>
	);
};

export default CompleteProfileSetupPage;
