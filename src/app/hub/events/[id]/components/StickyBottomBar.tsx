"use client";

import { Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { Check, X } from "lucide-react";

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
	onJoin?: () => void;
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
	onJoin,
}: StickyBottomBarProps) {
	// Calculate spots
	const totalSpots = teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0);
	const spotsLeft = Math.max(0, totalSpots - participants.length);

	// Cost display
	const hasCost = !!event.paymentConfig && event.paymentConfig.cost > 0;
	const costDisplay = isSubscriptionCovered && hasCost
		? "Covered by subscription"
		: event.paymentConfig ? `£${event.paymentConfig.cost}` : "Free";

	// Check if user is already a participant
	const isParticipant = myParticipation?.status === ParticipationStatus.Accepted;

	// Don't render if user is already a participant, event is full, or event is closed
	if (isParticipant || (isFull && !hasInvitation) || (!isOpen && !hasInvitation)) {
		return null;
	}

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
						leftIcon={<Check className="size-3.5" />}
						data-testid="sticky-accept-button">
						Accept
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
					<Button
						variant="default"
						size="sm"
						onClick={onJoin}
						className="min-w-[100px]"
						data-testid="sticky-join-button">
						Join Event
					</Button>
				</div>
			</div>
		);
	}

	return null;
}
