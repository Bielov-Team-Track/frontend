"use client";

import { Button, Input, Loader } from "@/components/ui";
import { useAuth } from "@/providers";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Mail, Lock } from "lucide-react";

function LoginContent() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [resendSuccess, setResendSuccess] = useState<boolean>(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const { login } = useAuth();

	const callback = searchParams.get("callback");

	const credentialsSignIn = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			await login(email, password);

			const targetRoute = callback || "/dashboard/events";

			router.push(targetRoute);
		} catch (error: any) {
			setIsLoading(false);
			const message =
				error.response?.data?.message ||
				error.response?.data?.error ||
				"Something went wrong, please try again later!";
			setError(message);

			console.error("Login error:", error);
		}
	};

	return (
		<>
			{isLoading && (
				<Loader className="bg-black/55 absolute inset-0 rounded-md" />
			)}
			<form onSubmit={credentialsSignIn} className="flex flex-col gap-4">
				<h1 className="text-4xl sm:text-5xl font-bold text-accent text-center mb-4">
					Volleyer
				</h1>
				<div className="text-center text-sm sm:text-base">
					Do not have an account?{" "}
					<Link href={"/sign-up"} className="link">
						Register
					</Link>
				</div>
				{error && <div className="text-red-500 text-sm">{error}</div>}
				{resendSuccess && (
					<div className="text-green-500 text-sm">
						Verification email sent! Please check your inbox.
					</div>
				)}
				<Input
					name="email"
					type="email"
					label="Email"
					placeholder="Enter your email"
					leftIcon={<Mail size={16} />}
					required
					onChange={() => {
						setError("");
						setResendSuccess(false);
					}}
				/>
				<Input
					name="password"
					type="password"
					label="Password"
					placeholder="Enter your password"
					leftIcon={<Lock size={16} />}
					showPasswordToggle
					required
					onChange={() => {
						setError("");
						setResendSuccess(false);
					}}
				/>
				<Link href={"/forgot-password"} className="link text-sm">
					Forgot your password?
				</Link>
				<Button>Login</Button>
			</form>
			{/* <div className="divider">OR</div>
        <div className="flex flex-col gap-4">
          Future OAuth buttons can go here 
        </div> */}
		</>
	);
}

// Google icon placeholder for future OAuth implementation
function getProviderLogo(id: string) {
	const iconSize = 24;
	switch (id) {
		case "google":
			return (
				<svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
			);
		default:
			return <></>;
	}
}

function LoginPage() {
	return (
		<Suspense fallback={<Loader />}>
			<LoginContent />
		</Suspense>
	);
}

export default LoginPage;
