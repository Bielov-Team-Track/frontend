"use client";

import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { CreditCard } from "lucide-react";

interface EventPaymentCardProps {
	event: Event;
	userParticipant?: EventParticipant | null;
	isInvited?: boolean;
	onPaymentRequired?: () => void;
}

export default function EventPaymentCard({
	event,
	userParticipant,
	isInvited = false,
	onPaymentRequired,
}: EventPaymentCardProps) {
	// Only show if payToJoin is enabled
	if (!event.paymentConfig?.payToJoin) {
		return null;
	}

	// Don't show if user is already an accepted participant
	if (userParticipant && userParticipant.status === ParticipationStatus.Accepted) {
		return null;
	}

	const buttonText = isInvited ? "Pay and accept" : "Pay and join";
	const currency = event.paymentConfig.currency || "£";
	const cost = event.paymentConfig.cost;

	return (
		<div className="p-6 rounded-2xl bg-surface border border-border" data-testid="event-payment-card">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold text-foreground">
							{isInvited ? "You're Invited!" : "Join This Event"}
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							{isInvited
								? "Accept your invitation by completing the payment"
								: "Payment is required to join this event"}
						</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-accent" data-testid="payment-card-cost">
							{currency}
							{cost}
						</div>
						<div className="text-xs text-muted-foreground">per person</div>
					</div>
				</div>

				<Button
					leftIcon={<CreditCard size={16} />}
					onClick={onPaymentRequired}
					fullWidth
					data-testid="pay-to-join-button"
				>
					{buttonText} - {currency}
					{cost}
				</Button>

				<p className="text-xs text-muted-foreground text-center">
					Secure payment powered by Stripe. You'll receive a confirmation email after payment.
				</p>
			</div>
		</div>
	);
}
