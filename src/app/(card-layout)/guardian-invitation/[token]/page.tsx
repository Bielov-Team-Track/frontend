"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Checkbox, Loader } from "@/components/ui";
import { CheckCircle2, AlertCircle, UserCheck, Shield } from "lucide-react";
import Link from "next/link";
import client from "@/lib/api/client";

interface TokenValidationResponse {
	valid: boolean;
}

interface ConsumeTokenResponse {
	minorName: string;
	minorAge: number;
	viewToken: string;
}

interface ConsentPayload {
	viewToken: string;
	coreProfileDataConsent: boolean;
	eventParticipationConsent: boolean;
	messagingConsent?: boolean;
	photoStorageConsent?: boolean;
}

export default function GuardianInvitationPage() {
	const params = useParams();
	const router = useRouter();
	const token = params.token as string;

	const [isValidating, setIsValidating] = useState(true);
	const [isValid, setIsValid] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [hasConsumed, setHasConsumed] = useState(false);
	const [minorData, setMinorData] = useState<ConsumeTokenResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Consent form state
	const [coreProfileDataConsent, setCoreProfileDataConsent] = useState(false);
	const [eventParticipationConsent, setEventParticipationConsent] = useState(false);
	const [messagingConsent, setMessagingConsent] = useState(false);
	const [photoStorageConsent, setPhotoStorageConsent] = useState(false);

	// Check if user is authenticated
	useEffect(() => {
		const checkAuth = async () => {
			try {
				await client.post("/auth/v1/auth/validate");
				setIsAuthenticated(true);
			} catch {
				setIsAuthenticated(false);
			}
		};
		checkAuth();
	}, []);

	// Validate token on mount
	useEffect(() => {
		const validateToken = async () => {
			setIsValidating(true);
			setError(null);

			try {
				const response = await client.get<TokenValidationResponse>(`/profiles/v1/family/consent/${token}`);
				setIsValid(response.data.valid);
			} catch (err: any) {
				setIsValid(false);
				setError(err.response?.data?.message || "Invalid or expired invitation link");
			} finally {
				setIsValidating(false);
			}
		};

		if (token) {
			validateToken();
		}
	}, [token]);

	const handleConsumeToken = async () => {
		if (!isAuthenticated) {
			// Redirect to login with return URL
			router.push(`/login?redirect=/guardian-invitation/${token}`);
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const response = await client.post<ConsumeTokenResponse>(`/profiles/v1/family/consent/${token}/consume`);
			setMinorData(response.data);
			setHasConsumed(true);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to load invitation details");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmitConsent = async () => {
		if (!minorData) return;

		// Validate mandatory consents
		if (!coreProfileDataConsent || !eventParticipationConsent) {
			setError("Please accept all required consents");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const payload: ConsentPayload = {
				viewToken: minorData.viewToken,
				coreProfileDataConsent,
				eventParticipationConsent,
				messagingConsent,
				photoStorageConsent,
			};

			await client.post("/profiles/v1/family/consent", payload);

			// Success - redirect to dashboard
			router.push("/hub?message=Guardian consent granted successfully");
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to grant consent");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Loading state
	if (isValidating) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<Loader />
				<p className="text-muted">Validating invitation...</p>
			</div>
		);
	}

	// Invalid token
	if (!isValid) {
		return (
			<div className="flex flex-col gap-6 items-center text-center py-8">
				<div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
					<AlertCircle className="text-red-500" size={32} />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Invalid Invitation</h1>
					<p className="text-muted mt-2">{error || "This invitation link is invalid or has expired."}</p>
				</div>
				<Link href="/login">
					<Button>Go to Login</Button>
				</Link>
			</div>
		);
	}

	// Valid token but not authenticated - show context and login prompt
	if (!isAuthenticated && !hasConsumed) {
		return (
			<div className="flex flex-col gap-6">
				<div className="text-center">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<UserCheck className="text-primary" size={32} />
					</div>
					<h1 className="text-3xl font-bold">Guardian Invitation</h1>
					<p className="text-muted mt-2">You have been invited to approve an account for a minor.</p>
				</div>

				<div className="border border-border rounded-lg p-6 space-y-4">
					<div className="flex items-start gap-3">
						<Shield className="text-primary mt-1" size={20} />
						<div>
							<h3 className="font-semibold">Why is this needed?</h3>
							<p className="text-sm text-muted mt-1">
								To comply with child protection laws, minors need guardian approval before creating an account.
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
						<span className="text-sm font-medium">{error}</span>
					</div>
				)}

				<div className="space-y-2">
					<Link href={`/login?redirect=/guardian-invitation/${token}`}>
						<Button className="w-full">Login to Continue</Button>
					</Link>
					<p className="text-center text-sm text-muted">
						Don't have an account?{" "}
						<Link href={`/sign-up?redirect=/guardian-invitation/${token}`} className="link">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		);
	}

	// Authenticated but not consumed - show consume button
	if (isAuthenticated && !hasConsumed) {
		return (
			<div className="flex flex-col gap-6">
				<div className="text-center">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<UserCheck className="text-primary" size={32} />
					</div>
					<h1 className="text-3xl font-bold">Guardian Invitation</h1>
					<p className="text-muted mt-2">You have been invited to approve an account for a minor.</p>
				</div>

				{error && (
					<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
						<span className="text-sm font-medium">{error}</span>
					</div>
				)}

				<Button onClick={handleConsumeToken} disabled={isSubmitting} loading={isSubmitting} className="w-full">
					View Invitation Details
				</Button>
			</div>
		);
	}

	// Consent form - after token consumed
	if (hasConsumed && minorData) {
		return (
			<div className="flex flex-col gap-6">
				{isSubmitting && <Loader className="bg-overlay absolute inset-0 rounded-md" />}

				<div className="text-center">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<UserCheck className="text-primary" size={32} />
					</div>
					<h1 className="text-3xl font-bold">Grant Guardian Consent</h1>
					<p className="text-muted mt-2">
						You are approving an account for <strong>{minorData.minorName}</strong> (Age: {minorData.minorAge})
					</p>
				</div>

				{/* Privacy Notice */}
				<div className="border border-border rounded-lg p-4 bg-surface-elevated">
					<h3 className="font-semibold mb-2">Privacy Notice</h3>
					<p className="text-sm text-muted">
						As a guardian, you can manage consent settings for this minor's account. The minor will be able to use the platform
						based on the permissions you grant below.
					</p>
				</div>

				{/* Mandatory Consents */}
				<div className="space-y-3">
					<h3 className="font-semibold">Required Permissions</h3>

					<Checkbox
						id="coreProfileData"
						checked={coreProfileDataConsent}
						onChange={(checked: boolean) => setCoreProfileDataConsent(checked)}
						label="Core Profile Data"
						helperText="Allow basic profile information (name, age, skill level) to be collected and displayed"
					/>

					<Checkbox
						id="eventParticipation"
						checked={eventParticipationConsent}
						onChange={(checked: boolean) => setEventParticipationConsent(checked)}
						label="Event Participation"
						helperText="Allow joining events, tracking attendance, and viewing event details"
					/>
				</div>

				{/* Optional Consents */}
				<div className="space-y-3">
					<h3 className="font-semibold">Optional Permissions</h3>

					<Checkbox
						id="messaging"
						checked={messagingConsent}
						onChange={(checked: boolean) => setMessagingConsent(checked)}
						label="Messaging"
						helperText="Allow sending and receiving messages with other users"
					/>

					<Checkbox
						id="photoStorage"
						checked={photoStorageConsent}
						onChange={(checked: boolean) => setPhotoStorageConsent(checked)}
						label="Photo Storage"
						helperText="Allow uploading and storing profile pictures and event photos"
					/>
				</div>

				{error && (
					<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
						<span className="text-sm font-medium">{error}</span>
					</div>
				)}

				<Button
					onClick={handleSubmitConsent}
					disabled={isSubmitting || !coreProfileDataConsent || !eventParticipationConsent}
					className="w-full gap-2"
					leftIcon={<CheckCircle2 size={20} />}>
					Grant Consent
				</Button>

				<p className="text-xs text-muted text-center">
					By granting consent, you confirm that you are the legal guardian of {minorData.minorName} and authorize their use of
					this platform.
				</p>
			</div>
		);
	}

	return null;
}
