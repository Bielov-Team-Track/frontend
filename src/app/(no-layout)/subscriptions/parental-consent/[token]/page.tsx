"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Checkbox } from "@/components/ui";
import { verifyParentalConsent } from "@/lib/api/club-subscriptions";
import { showErrorToast } from "@/lib/errors";

export default function ParentalConsentPage() {
	const { token } = useParams<{ token: string }>();
	const [consentChecked, setConsentChecked] = useState(false);

	const consentMutation = useMutation({
		mutationFn: () => verifyParentalConsent(token),
		onError: (error) => {
			showErrorToast(error, { fallback: "Failed to verify consent" });
		},
	});

	// Success state
	if (consentMutation.isSuccess) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
						<CheckCircle className="w-8 h-8 text-green-500" />
					</div>
					<h1 className="text-2xl font-bold">Consent Verified</h1>
					<p className="text-muted-foreground">
						Your parental consent has been recorded. The minor can now use the subscription and access all included benefits.
					</p>
				</div>
			</PageWrapper>
		);
	}

	// Error state
	if (consentMutation.isError) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h1 className="text-2xl font-bold">Consent Verification Failed</h1>
					<p className="text-muted-foreground">
						This consent link has expired or is no longer valid. Please contact the subscription holder to request a new link.
					</p>
					<Button variant="outline" onClick={() => consentMutation.reset()}>
						Try Again
					</Button>
				</div>
			</PageWrapper>
		);
	}

	// Initial state
	return (
		<PageWrapper>
			<div className="space-y-6">
				<div className="text-center space-y-2">
					<div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
						<ShieldCheck className="w-6 h-6 text-primary" />
					</div>
					<h1 className="text-2xl font-bold">Parental Consent Required</h1>
					<p className="text-muted-foreground">
						A minor has been added to a family subscription. As their parent or guardian, your consent is required before they can use the service.
					</p>
				</div>

				{/* Privacy notice */}
				<div className="rounded-lg border border-border bg-background p-4 space-y-3 text-sm">
					<h2 className="font-semibold text-base">Privacy Notice for Minors</h2>

					<div className="space-y-2 text-muted-foreground">
						<div>
							<p className="font-medium text-foreground">What data is collected</p>
							<p>
								We collect basic profile information (name, date of birth), activity data related to volleyball events and club participation, and usage data for service improvement.
							</p>
						</div>

						<div>
							<p className="font-medium text-foreground">How it is used</p>
							<p>
								The data is used solely to provide the subscription services, including event participation, team management, and communication within the club. We do not sell or share personal data with third parties for marketing purposes.
							</p>
						</div>

						<div>
							<p className="font-medium text-foreground">Your rights</p>
							<p>
								As a parent or guardian, you have the right to review, modify, or request deletion of your child&apos;s data at any time. You may also withdraw this consent, which will result in the minor&apos;s removal from the subscription.
							</p>
						</div>
					</div>
				</div>

				{/* Consent checkbox */}
				<Checkbox
					checked={consentChecked}
					onChange={setConsentChecked}
					label="I confirm that I am the parent or legal guardian of the minor and I consent to their participation in the subscription and the collection and use of their data as described above."
					required
				/>

				<Button
					onClick={() => consentMutation.mutate()}
					disabled={!consentChecked || consentMutation.isPending}
					className="w-full"
				>
					{consentMutation.isPending ? "Verifying..." : "Give Consent"}
				</Button>
			</div>
		</PageWrapper>
	);
}

function PageWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto sm:px-4 sm:py-8">
				<div className="max-w-lg mx-auto bg-card rounded-lg shadow-xl sm:p-8 p-4">{children}</div>
			</div>
		</div>
	);
}
