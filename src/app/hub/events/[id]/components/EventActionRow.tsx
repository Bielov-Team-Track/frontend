"use client";

import { Button } from "@/components";
import { Check, Clock, X } from "lucide-react";

interface EventActionRowProps {
	isOpen: boolean;
	isFull: boolean;
	hasInvitation: boolean;
	isParticipant: boolean;
	isWaitlisted: boolean;
	canceled: boolean;
	onAccept?: () => void;
	onDecline?: () => void;
	onWithdraw?: () => void;
	onJoin?: () => void;
	onJoinWaitlist?: () => void;
}

export default function EventActionRow({
	isOpen,
	isFull,
	hasInvitation,
	isParticipant,
	isWaitlisted,
	canceled,
	onAccept,
	onDecline,
	onWithdraw,
	onJoin,
	onJoinWaitlist,
}: EventActionRowProps) {
	const showAcceptedBadge = isParticipant && !hasInvitation;

	return (
		<div className="flex items-center gap-3 px-5 py-2.5 border-t border-border lg:border-t-0 lg:border-l lg:py-2.5">
			{/* Accepted badge + Withdraw option — shown when user has accepted/attended */}
			{showAcceptedBadge && (
				<>
					<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-success text-white">
						<Check size={12} />
						Accepted
					</span>
					{!canceled && (
						<Button
							variant="ghost"
							color="error"
							size="sm"
							leftIcon={<X size={14} />}
							onClick={onWithdraw}
							aria-label="Change decision — decline"
							data-testid="desktop-withdraw-button"
						>
							Decline
						</Button>
					)}
				</>
			)}

			{/* Waitlisted badge — shown when user is already on the waitlist */}
			{isWaitlisted && (
				<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-warning/10 text-warning border border-warning/20">
					<Clock size={12} />
					Waitlisted
				</span>
			)}

			{/* Join Waitlist — visible on ALL screen sizes because StickyBottomBar returns null for full events */}
			{isOpen && isFull && !hasInvitation && !isParticipant && !isWaitlisted && !canceled && (
				<Button
					variant="outline"
					color="neutral"
					size="sm"
					onClick={onJoinWaitlist}
					aria-label="Join the waitlist"
					data-testid="desktop-join-waitlist-button"
				>
					Join Waitlist
				</Button>
			)}

			{/* CTA Buttons — hidden on mobile; StickyBottomBar handles mobile CTAs */}
			<div className="hidden lg:flex items-center gap-2">
				{hasInvitation && !canceled && (
					<>
						<Button
							variant="outline"
							color="error"
							size="sm"
							leftIcon={<X size={14} />}
							onClick={onDecline}
							aria-label="Decline invitation"
							data-testid="desktop-decline-invitation-button"
						>
							Decline
						</Button>
						<Button
							color="success"
							size="sm"
							leftIcon={<Check size={14} />}
							onClick={onAccept}
							aria-label="Accept invitation"
							data-testid="desktop-accept-invitation-button"
						>
							Accept
						</Button>
					</>
				)}
				{isOpen && !isFull && !hasInvitation && !isParticipant && !canceled && (
					<Button
						color="primary"
						size="sm"
						onClick={onJoin}
						aria-label="Join this event"
						data-testid="desktop-join-event-button"
					>
						Join Event
					</Button>
				)}
			</div>
		</div>
	);
}
