"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Users, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { acceptFamilyInvitation } from "@/lib/api/club-subscriptions";
import { ApiError, showErrorToast } from "@/lib/errors";
import Link from "next/link";

export default function FamilyInvitationPage() {
	const { token } = useParams<{ token: string }>();
	const [requiresLogin, setRequiresLogin] = useState(false);

	const acceptMutation = useMutation({
		mutationFn: () => acceptFamilyInvitation(token),
		onError: (error) => {
			const apiError = ApiError.fromError(error);
			if (apiError.status === 401) {
				setRequiresLogin(true);
			} else {
				showErrorToast(error, { fallback: "Failed to accept invitation" });
			}
		},
	});

	// Success state
	if (acceptMutation.isSuccess) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
						<CheckCircle className="w-8 h-8 text-green-500" />
					</div>
					<h1 className="text-2xl font-bold">Welcome to the Family Plan!</h1>
					<p className="text-muted-foreground">
						You have been successfully added to the family subscription. You can now enjoy all the benefits of the plan.
					</p>
				</div>
			</PageWrapper>
		);
	}

	// Requires login state
	if (requiresLogin) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
						<AlertCircle className="w-8 h-8 text-amber-500" />
					</div>
					<h1 className="text-2xl font-bold">Login Required</h1>
					<p className="text-muted-foreground">
						You need to be logged in to accept this invitation. Please log in and then try this link again.
					</p>
					<Link href="/login">
						<Button className="w-full">Go to Login</Button>
					</Link>
				</div>
			</PageWrapper>
		);
	}

	// Error state (non-401)
	if (acceptMutation.isError && !requiresLogin) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h1 className="text-2xl font-bold">Invitation Invalid</h1>
					<p className="text-muted-foreground">
						This invitation has expired or is no longer valid. Please contact the subscription holder for a new invitation.
					</p>
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
						<Users className="w-6 h-6 text-primary" />
					</div>
					<h1 className="text-2xl font-bold">Family Plan Invitation</h1>
					<p className="text-muted-foreground">
						You have been invited to join a family subscription. By accepting, you will get access to all the benefits included in the plan.
					</p>
				</div>

				<Button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending} className="w-full">
					{acceptMutation.isPending ? "Accepting..." : "Accept Invitation"}
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
