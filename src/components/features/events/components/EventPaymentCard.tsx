"use client";

import { Button } from "@/components/ui";
import { createEventCheckoutSession } from "@/lib/api/payments";
import { Event } from "@/lib/models/Event";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { CreditCard } from "lucide-react";
import { useState } from "react";

interface EventPaymentCardProps {
	event: Event;
	userParticipant?: EventParticipant | null;
	isInvited?: boolean;
}

export default function EventPaymentCard({ event, userParticipant, isInvited = false }: EventPaymentCardProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Only show if payToJoin is enabled
	if (!event.budget?.payToJoin) {
		return null;
	}

	// Don't show if user is already an accepted participant
	if (userParticipant && userParticipant.status === ParticipationStatus.Accepted) {
		return null;
	}

	const handlePayToJoin = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const checkoutUrl = await createEventCheckoutSession(event.id);
			window.location.href = checkoutUrl;
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to create checkout session. Please try again.");
			setIsLoading(false);
		}
	};

	const buttonText = isInvited ? "Pay and accept" : "Pay and join";
	const currency = event.budget.currency || "£";
	const cost = event.budget.cost;

	return (
		<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold text-white">
							{isInvited ? "You're Invited!" : "Join This Event"}
						</h3>
						<p className="text-sm text-muted mt-1">
							{isInvited
								? "Accept your invitation by completing the payment"
								: "Payment is required to join this event"}
						</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-accent">
							{currency}
							{cost}
						</div>
						<div className="text-xs text-muted">per person</div>
					</div>
				</div>

				{error && (
					<div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">{error}</div>
				)}

				<Button
					leftIcon={<CreditCard size={16} />}
					onClick={handlePayToJoin}
					loading={isLoading}
					disabled={isLoading}
					fullWidth
				>
					{buttonText} - {currency}
					{cost}
				</Button>

				<p className="text-xs text-muted text-center">
					Secure payment powered by Stripe. You'll receive a confirmation email after payment.
				</p>
			</div>
		</div>
	);
}
