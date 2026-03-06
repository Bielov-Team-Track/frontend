"use client";

import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Loader } from "@/components/ui";
import { createEventPaymentIntent } from "@/lib/api/payments";
import { getMyParticipation } from "@/lib/api/events";
import { ParticipationStatus } from "@/lib/models/EventParticipant";
import { showErrorToast } from "@/lib/errors";
import { CreditCard } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const stripeAppearance = {
	theme: "night" as const,
	variables: {
		colorPrimary: "#ff6900",
		colorBackground: "#161616",
		colorText: "#fafafa",
		colorDanger: "#ff6467",
		colorTextSecondary: "#a1a1a1",
		colorTextPlaceholder: "#a1a1a1",
		borderRadius: "12px",
	},
};

interface EventPaymentFormProps {
	eventId: string;
	eventName: string;
	cost: number;
	currency?: string;
	onSuccess: () => void;
	onCancel: () => void;
}

export default function EventPaymentForm({
	eventId,
	eventName,
	cost,
	currency = "£",
	onSuccess,
	onCancel,
}: EventPaymentFormProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [isFetchingSecret, setIsFetchingSecret] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchPaymentIntent() {
			try {
				setIsFetchingSecret(true);
				setFetchError(null);
				const result = await createEventPaymentIntent(eventId);
				if (!cancelled) {
					setClientSecret(result.clientSecret);
				}
			} catch (err) {
				if (!cancelled) {
					showErrorToast(err, { fallback: "Failed to initialise payment" });
					setFetchError("Failed to initialise payment. Please try again.");
				}
			} finally {
				if (!cancelled) {
					setIsFetchingSecret(false);
				}
			}
		}

		fetchPaymentIntent();

		return () => {
			cancelled = true;
		};
	}, [eventId]);

	if (isFetchingSecret) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-10">
				<Loader />
				<p className="text-sm text-muted-foreground">Preparing payment...</p>
			</div>
		);
	}

	if (fetchError || !clientSecret) {
		return (
			<div className="space-y-4">
				<div className="p-4 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
					{fetchError ?? "Could not load payment form. Please try again."}
				</div>
				<div className="flex gap-3">
					<Button variant="outline" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{
				clientSecret,
				appearance: stripeAppearance,
			}}
		>
			<PaymentFormInner
				eventId={eventId}
				eventName={eventName}
				cost={cost}
				currency={currency}
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		</Elements>
	);
}

// ---------------------------------------------------------------------------
// Inner form — rendered inside <Elements> so useStripe/useElements work
// ---------------------------------------------------------------------------

interface PaymentFormInnerProps {
	eventId: string;
	eventName: string;
	cost: number;
	currency: string;
	onSuccess: () => void;
	onCancel: () => void;
}

function PaymentFormInner({
	eventId,
	eventName,
	cost,
	currency,
	onSuccess,
	onCancel,
}: PaymentFormInnerProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pollParticipationStatus = useCallback(async () => {
		const delays = [500, 1000, 2000, 4000]; // exponential backoff in ms
		const deadline = Date.now() + 15_000; // 15s total timeout

		for (const delay of delays) {
			if (Date.now() >= deadline) break;

			await new Promise<void>((resolve) => setTimeout(resolve, delay));

			if (Date.now() >= deadline) break;

			try {
				const participation = await getMyParticipation(eventId);
				if (participation?.status === ParticipationStatus.Accepted) {
					onSuccess();
					return;
				}
			} catch {
				// ignore transient errors — keep polling
			}
		}

		// Timeout fallback — payment was received but processing is slow
		onSuccess();
	}, [eventId, onSuccess]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!stripe || !elements) return;

			setIsProcessing(true);
			setError(null);

			try {
				const result = await stripe.confirmPayment({
					elements,
					confirmParams: {
						return_url: `${window.location.origin}/hub/events/${eventId}`,
					},
					redirect: "if_required",
				});

				if (result.error) {
					setError(result.error.message ?? "Payment failed. Please try again.");
					return;
				}

				// Payment confirmed — poll until the backend processes the webhook
				setIsPolling(true);
				await pollParticipationStatus();
			} catch {
				setError("An unexpected error occurred. Please try again.");
			} finally {
				setIsProcessing(false);
				setIsPolling(false);
			}
		},
		[stripe, elements, eventId, pollParticipationStatus],
	);

	const isLoading = isProcessing || isPolling;

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Header */}
			<div className="flex items-center justify-between pb-2 border-b border-border">
				<div className="flex items-center gap-2">
					<CreditCard size={18} className="text-accent" />
					<span className="text-sm font-medium text-white truncate max-w-[200px]">{eventName}</span>
				</div>
				<span className="text-xl font-bold text-accent">
					{currency}
					{cost}
				</span>
			</div>

			{/* Stripe Payment Element */}
			<PaymentElement options={{ wallets: { applePay: "auto", googlePay: "auto" } }} />

			{/* Inline error */}
			{error && (
				<p className="text-sm text-red-400" role="alert">
					{error}
				</p>
			)}

			{/* Processing state */}
			{isPolling && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader />
					<span>Processing payment...</span>
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-3 pt-1">
				<Button
					type="button"
					variant="outline"
					color="neutral"
					onClick={onCancel}
					disabled={isLoading}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!stripe || isLoading}
					loading={isLoading}
					className="flex-1"
				>
					{isPolling ? "Processing..." : `Pay ${currency}${cost}`}
				</Button>
			</div>

			<p className="text-xs text-muted-foreground text-center">
				Secure payment powered by Stripe.
			</p>
		</form>
	);
}
