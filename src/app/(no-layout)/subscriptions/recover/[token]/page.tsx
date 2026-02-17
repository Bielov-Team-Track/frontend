"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Loader } from "@/components/ui";
import { redeemRecoveryToken } from "@/lib/api/club-subscriptions";
import { PaymentRecoveryResult } from "@/lib/models/Subscription";
import { showErrorToast } from "@/lib/errors";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function PaymentRecoveryPage() {
	const { token } = useParams<{ token: string }>();
	const [recoveryResult, setRecoveryResult] = useState<PaymentRecoveryResult | null>(null);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	const redeemMutation = useMutation({
		mutationFn: () => redeemRecoveryToken(token),
		onSuccess: (result) => {
			setRecoveryResult(result);
		},
		onError: (error) => {
			showErrorToast(error, { fallback: "Failed to validate recovery link" });
		},
	});

	// Success state
	if (paymentSuccess) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
						<CheckCircle className="w-8 h-8 text-green-500" />
					</div>
					<h1 className="text-2xl font-bold">Payment Method Updated</h1>
					<p className="text-muted-foreground">
						Your payment method has been updated successfully. Your subscription will continue without interruption.
					</p>
				</div>
			</PageWrapper>
		);
	}

	// Error state
	if (redeemMutation.isError) {
		return (
			<PageWrapper>
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h1 className="text-2xl font-bold">Invalid Recovery Link</h1>
					<p className="text-muted-foreground">
						This recovery link has expired, has already been used, or is no longer valid. Please contact your club administrator for a new link.
					</p>
				</div>
			</PageWrapper>
		);
	}

	// Stripe payment form
	if (recoveryResult) {
		return (
			<PageWrapper>
				<div className="space-y-6">
					<div className="text-center space-y-2">
						<div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
							<CreditCard className="w-6 h-6 text-primary" />
						</div>
						<h1 className="text-2xl font-bold">Update Payment Method</h1>
					</div>

					<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
						<p className="font-medium text-amber-400">Your subscription payment failed</p>
						<p className="mt-1 text-muted-foreground">
							Please provide a new payment method to keep your subscription active. You have a limited grace period before your subscription is suspended.
						</p>
					</div>

					<Elements
						stripe={stripePromise}
						options={{
							clientSecret: recoveryResult.clientSecret,
							appearance: {
								theme: "night",
								variables: {
									colorPrimary: "#6366f1",
									colorBackground: "#1a1a2e",
									colorText: "#e2e8f0",
									borderRadius: "12px",
								},
							},
						}}
					>
						<RecoveryPaymentForm onSuccess={() => setPaymentSuccess(true)} />
					</Elements>
				</div>
			</PageWrapper>
		);
	}

	// Initial state - prompt to start recovery
	return (
		<PageWrapper>
			<div className="space-y-6">
				<div className="text-center space-y-2">
					<div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
						<CreditCard className="w-6 h-6 text-primary" />
					</div>
					<h1 className="text-2xl font-bold">Update Payment Method</h1>
					<p className="text-muted-foreground">
						Click below to update your payment method and resume your subscription.
					</p>
				</div>

				<Button onClick={() => redeemMutation.mutate()} disabled={redeemMutation.isPending} className="w-full">
					{redeemMutation.isPending ? "Validating..." : "Continue"}
				</Button>
			</div>
		</PageWrapper>
	);
}

function RecoveryPaymentForm({ onSuccess }: { onSuccess: () => void }) {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!stripe || !elements) return;

			setIsProcessing(true);
			setError(null);

			try {
				const result = await stripe.confirmSetup({
					elements,
					confirmParams: { return_url: window.location.href },
					redirect: "if_required",
				});

				if (result.error) {
					setError(result.error.message || "Payment failed");
				} else {
					onSuccess();
				}
			} catch {
				setError("An unexpected error occurred");
			} finally {
				setIsProcessing(false);
			}
		},
		[stripe, elements, onSuccess]
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<PaymentElement />
			{error && (
				<p className="text-sm text-red-400" role="alert">
					{error}
				</p>
			)}
			<Button type="submit" disabled={!stripe || isProcessing} className="w-full">
				{isProcessing ? "Processing..." : "Update Payment Method"}
			</Button>
		</form>
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
