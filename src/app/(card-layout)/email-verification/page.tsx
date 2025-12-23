"use client";

import React, { useState, Suspense } from "react";
import { sendVerification } from "@/lib/api/auth";
import Loader from "@/components/ui/loader";
import { Button } from "@/components";
import { Mail } from "lucide-react";
import Link from "next/link";

function EmailVerificationContent() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [resendSuccess, setResendSuccess] = useState<boolean>(false);

	const handleResendEmail = async () => {
		setIsLoading(true);
		setError("");
		setResendSuccess(false);

		try {
			await sendVerification();
			setResendSuccess(true);
		} catch (error: any) {
			setError("Failed to send verification email. Please try again.");
			console.error("Resend email error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-4 justify-center items-center text-center">
				<div className="flex gap-2 items-center">
					<Mail size={24} />
					<h1 className="text-2xl font-bold">Verification email sent</h1>
				</div>
				<p className="text-primary-content/70">
					We sent a verification email to your email address. Please check your
					inbox and click the verification link.
				</p>
				<Link href="/login" className="btn btn-link">
					Go back to login
				</Link>
			</div>
			<Button onClick={handleResendEmail} disabled={isLoading}>
				{isLoading ? (
					<span className="flex items-center gap-2">
						<Loader />
						Sending...
					</span>
				) : (
					"Resend Verification Email"
				)}
			</Button>
			{error && <div className="text-red-500 text-center">{error}</div>}
			{resendSuccess && (
				<div className="text-green-500 text-center">
					Verification email sent! Please check your inbox.
				</div>
			)}
		</>
	);
}

function EmailVerificationPage() {
	return (
		<Suspense fallback={<Loader />}>
			<EmailVerificationContent />
		</Suspense>
	);
}

export default EmailVerificationPage;
