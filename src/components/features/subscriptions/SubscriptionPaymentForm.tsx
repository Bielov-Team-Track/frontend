"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Loader } from "@/components/ui";
import { SubscriptionPlan, SubscribeResult } from "@/lib/models/Subscription";
import PreContractInfo from "./PreContractInfo";
import AcknowledgmentCheckbox from "./AcknowledgmentCheckbox";
import { useSubscribeToPlan } from "@/hooks/useSubscriptions";
import { showErrorToast } from "@/lib/errors";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface Props {
	plan: SubscriptionPlan;
	onSuccess: () => void;
	onBack: () => void;
}

export default function SubscriptionPaymentForm({ plan, onSuccess, onBack }: Props) {
	const [subscribeResult, setSubscribeResult] = useState<SubscribeResult | null>(null);
	const [autoRenewal, setAutoRenewal] = useState(false);
	const [cancellationRights, setCancellationRights] = useState(false);
	const subscribeMutation = useSubscribeToPlan();

	const handleSubscribe = () => {
		subscribeMutation.mutate(
			{
				planId: plan.id,
				request: {
					termsVersion: "1.0",
					userConfirmedAutoRenewal: autoRenewal,
					userConfirmedCancellationRights: cancellationRights,
				},
			},
			{
				onSuccess: (result) => {
					if (result.clientSecret) {
						setSubscribeResult(result);
					} else {
						// No payment needed (e.g., pending approval)
						onSuccess();
					}
				},
				onError: (error) => {
					showErrorToast(error, { fallback: "Failed to start subscription" });
				},
			}
		);
	};

	const bothConfirmed = autoRenewal && cancellationRights;

	// Pre-payment step: show plan info and acknowledgments
	if (!subscribeResult) {
		return (
			<div className="space-y-6">
				<PreContractInfo plan={plan} />
				<AcknowledgmentCheckbox
					autoRenewalConfirmed={autoRenewal}
					cancellationRightsConfirmed={cancellationRights}
					onAutoRenewalChange={setAutoRenewal}
					onCancellationRightsChange={setCancellationRights}
				/>
				<div className="flex gap-3">
					<Button variant="outline" onClick={onBack} className="flex-1">
						Back
					</Button>
					<Button
						onClick={handleSubscribe}
						disabled={!bothConfirmed || subscribeMutation.isPending}
						className="flex-1"
					>
						{subscribeMutation.isPending ? "Processing..." : plan.requiresApproval ? "Submit Application" : "Continue to Payment"}
					</Button>
				</div>
			</div>
		);
	}

	// Payment step: Stripe Elements
	return (
		<Elements
			stripe={stripePromise}
			options={{
				clientSecret: subscribeResult.clientSecret!,
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
			<StripePaymentStep
				clientSecretType={subscribeResult.clientSecretType || "payment"}
				onSuccess={onSuccess}
			/>
		</Elements>
	);
}

function StripePaymentStep({ clientSecretType, onSuccess }: { clientSecretType: string; onSuccess: () => void }) {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements) return;

		setIsProcessing(true);
		setError(null);

		try {
			let result;
			if (clientSecretType === "setup") {
				result = await stripe.confirmSetup({
					elements,
					confirmParams: { return_url: `${window.location.origin}/hub/settings/payments` },
					redirect: "if_required",
				});
			} else {
				result = await stripe.confirmPayment({
					elements,
					confirmParams: { return_url: `${window.location.origin}/hub/settings/payments` },
					redirect: "if_required",
				});
			}

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
	}, [stripe, elements, clientSecretType, onSuccess]);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<PaymentElement />
			{error && (
				<p className="text-sm text-red-400" role="alert">{error}</p>
			)}
			<Button type="submit" disabled={!stripe || isProcessing} className="w-full">
				{isProcessing ? "Processing..." : clientSecretType === "setup" ? "Save Card & Start Trial" : "Pay & Subscribe"}
			</Button>
		</form>
	);
}
