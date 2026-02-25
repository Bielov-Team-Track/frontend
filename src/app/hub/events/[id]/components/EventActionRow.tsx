"use client";

import { Button } from "@/components";
import { Check, Clock, X } from "lucide-react";

interface EventActionRowProps {
	isOpen: boolean;
	isFull: boolean;
	hasInvitation: boolean;
	isParticipant: boolean;
	isDeclined: boolean;
	isWaitlisted: boolean;
	canceled: boolean;
	onAccept?: () => void;
	onDecline?: () => void;
	onWithdraw?: () => void;
	onReaccept?: () => void;
	onJoin?: () => void;
	onJoinWaitlist?: () => void;
}

export default function EventActionRow({
	isOpen,
	isFull,
	hasInvitation,
	isParticipant,
	isDeclined,
	isWaitlisted,
	canceled,
	onAccept,
	onDecline,
	onWithdraw,
	onReaccept,
	onJoin,
	onJoinWaitlist,
}: EventActionRowProps) {
	// User has responded (accepted or declined) — show persistent toggle buttons
	const hasResponded = (isParticipant || isDeclined) && !hasInvitation;

	return (
		<div className="flex items-center gap-3 px-5 py-2.5 border-t border-border lg:border-t-0 lg:border-l lg:py-2.5">
			{/* Persistent Accept/Decline toggle — shown after user has responded */}
			{hasResponded && !canceled && (
				<div className="flex items-center gap-2">
					<button
						onClick={isDeclined ? onReaccept : undefined}
						disabled={isParticipant}
						className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
							isParticipant
								? "bg-success text-white"
								: "bg-success/10 text-success border border-success/20 hover:bg-success/20 cursor-pointer"
						}`}
						data-testid="desktop-accept-toggle"
					>
						<Check size={12} />
						Accepted
					</button>
					<button
						onClick={isParticipant ? onWithdraw : undefined}
						disabled={isDeclined}
						className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
							isDeclined
								? "bg-error text-white"
								: "bg-error/10 text-error border border-error/20 hover:bg-error/20 cursor-pointer"
						}`}
						data-testid="desktop-decline-toggle"
					>
						<X size={12} />
						Declined
					</button>
				</div>
			)}

			{/* Waitlisted badge — shown when user is already on the waitlist */}
			{isWaitlisted && (
				<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-warning/10 text-warning border border-warning/20">
					<Clock size={12} />
					Waitlisted
				</span>
			)}

			{/* Join Waitlist — visible on ALL screen sizes because StickyBottomBar returns null for full events */}
			{isOpen && isFull && !hasInvitation && !isParticipant && !isDeclined && !isWaitlisted && !canceled && (
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
				{isOpen && !isFull && !hasInvitation && !isParticipant && !isDeclined && !canceled && (
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
