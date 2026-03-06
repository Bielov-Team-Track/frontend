"use client";

import { Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { Check, CreditCard, MessageCircle, X } from "lucide-react";

interface StickyBottomBarProps {
	event: Event;
	participants: EventParticipant[];
	teams: Team[];
	myParticipation: EventParticipant | null | undefined;
	isOpen: boolean;
	isFull: boolean;
	hasInvitation: boolean;
	isSubscriptionCovered?: boolean;
	onAccept: () => void;
	onDecline: () => void;
	onWithdraw?: () => void;
	onReaccept?: () => void;
	onJoin?: () => void;
	onMessageOrganizers?: () => void;
}

export default function StickyBottomBar({
	event,
	participants,
	teams,
	myParticipation,
	isOpen,
	isFull,
	hasInvitation,
	isSubscriptionCovered,
	onAccept,
	onDecline,
	onWithdraw,
	onReaccept,
	onJoin,
	onMessageOrganizers,
}: StickyBottomBarProps) {
	// Calculate spots
	const totalSpots = teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0);
	const spotsLeft = Math.max(0, totalSpots - participants.length);

	// Cost display
	const hasCost = !!event.paymentConfig && event.paymentConfig.cost > 0;
	const costDisplay = isSubscriptionCovered && hasCost
		? "Covered by subscription"
		: event.paymentConfig ? `£${event.paymentConfig.cost}` : "Free";

	// Check participation states
	const isParticipant = myParticipation?.status === ParticipationStatus.Accepted || myParticipation?.status === ParticipationStatus.Attended;
	const isDeclined = myParticipation?.status === ParticipationStatus.Declined;
	const hasResponded = (isParticipant || isDeclined) && !hasInvitation;

	// Don't render if event is full (and no invitation/response), or event is closed (and no invitation/response)
	if ((isFull && !hasInvitation && !hasResponded) || (!isOpen && !hasInvitation && !hasResponded)) {
		return null;
	}

	// Variant 0: User has responded (accepted or declined) — show toggle buttons
	if (hasResponded) {
		return (
			<div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" data-testid="sticky-bottom-bar">
				<div className="flex items-center justify-center gap-3">
					<Button
						size="sm"
						variant={isParticipant ? "default" : "outline"}
						leftIcon={<Check className="size-3.5" />}
						onClick={isDeclined ? onReaccept : undefined}
						disabled={isParticipant}
						className={isParticipant ? "bg-success text-white border-success hover:bg-success/90 disabled:opacity-100" : "border-success/30 text-success hover:bg-success/10"}
						data-testid="sticky-accept-toggle"
					>
						{isParticipant ? "Accepted" : "Accept"}
					</Button>
					<Button
						size="sm"
						variant={isDeclined ? "default" : "outline"}
						leftIcon={<X className="size-3.5" />}
						onClick={isParticipant ? onWithdraw : undefined}
						disabled={isDeclined}
						className={isDeclined ? "bg-error text-white border-error hover:bg-error/90 disabled:opacity-100" : "border-error/30 text-error hover:bg-error/10"}
						data-testid="sticky-decline-toggle"
					>
						Decline
					</Button>
				</div>
			</div>
		);
	}

	// Derived: pay-to-join gate
	const payToJoin = !!event.paymentConfig?.payToJoin;

	// Variant 1: Invited state
	if (hasInvitation) {
		const inviterName = myParticipation?.invitedByUser
			? `${myParticipation.invitedByUser.firstName} ${myParticipation.invitedByUser.lastName}`.trim() || "Organizer"
			: "Organizer";

		return (
			<div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" data-testid="sticky-bottom-bar">
				<div className="flex items-center gap-3">
					<div className="flex-1 min-w-0 pl-1">
						<div className="text-[10px] text-muted-foreground">Invited by {inviterName}</div>
						<div className="text-xs font-semibold text-foreground">
							<span className={isSubscriptionCovered && hasCost ? "text-emerald-500" : ""}>{costDisplay}</span> · {spotsLeft} spots left
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={onDecline}
						leftIcon={<X className="size-3.5" />}
						data-testid="sticky-decline-button">
						Decline
					</Button>
					<Button
						variant="default"
						size="sm"
						onClick={onAccept}
						leftIcon={payToJoin ? <CreditCard className="size-3.5" /> : <Check className="size-3.5" />}
						data-testid="sticky-accept-button">
						{payToJoin ? "Pay & Accept" : "Accept"}
					</Button>
				</div>
			</div>
		);
	}

	// Variant 2: Open registration
	if (isOpen && !isFull && !isParticipant) {
		return (
			<div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" data-testid="sticky-bottom-bar">
				<div className="flex items-center gap-3">
					<div className="flex-1 min-w-0 pl-1">
						<div className="text-xs font-semibold text-foreground">
							{spotsLeft} spots left · <span className={isSubscriptionCovered && hasCost ? "text-emerald-500" : ""}>{costDisplay}</span>
						</div>
					</div>
					{event.isPrivate ? (
						<Button
							variant="outline"
							size="sm"
							onClick={onMessageOrganizers}
							leftIcon={<MessageCircle className="size-3.5" />}
							data-testid="sticky-message-organizers-button">
							Message Organizers
						</Button>
					) : (
						<Button
							variant="default"
							size="sm"
							onClick={onJoin}
							leftIcon={payToJoin ? <CreditCard className="size-3.5" /> : undefined}
							className="min-w-[100px]"
							data-testid="sticky-join-button">
							{payToJoin ? "Pay & Join" : "Join Event"}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return null;
}
