"use client";

import { CompleteProfileSetupForm } from "@/components/features/profile";
import { redirect, useRouter } from "next/navigation";

const CompleteProfileSetupPage = () => {
	const router = useRouter();

	const handleProfileComplete = () => {
		// Redirect to the main application page or dashboard after profile completion
		router.push("/dashboard");
	};

	return (
		<>
			<h1 className="text-2xl text-center font-bold">
				🎉 Welcome to the Volleyer!
			</h1>
			<p className="text-primary-content/70 text-center">
				Please complete your profile setup to access all features of the
				application.
			</p>
			<CompleteProfileSetupForm onProfileComplete={handleProfileComplete} />
		</>
	);
};

export default CompleteProfileSetupPage;
