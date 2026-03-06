"use client";

import { Button } from "@/components";
import { Check, Clock, MessageCircle, X } from "lucide-react";

interface EventActionRowProps {
	isOpen: boolean;
	isFull: boolean;
	isPrivate: boolean;
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
	onMessageOrganizers?: () => void;
}

export default function EventActionRow({
	isOpen,
	isFull,
	isPrivate,
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
	onMessageOrganizers,
}: EventActionRowProps) {
	// User has responded (accepted or declined) — show persistent toggle buttons
	const hasResponded = (isParticipant || isDeclined) && !hasInvitation;

	return (
		<div className="flex items-center gap-2 px-5 py-2.5 border-t border-border lg:border-t-0 lg:border-l lg:py-2.5">
			{/* Persistent Accept/Decline toggle — shown after user has responded */}
			{hasResponded && !canceled && (
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant={isParticipant ? "default" : "outline"}
						leftIcon={<Check size={14} />}
						onClick={isDeclined ? onReaccept : undefined}
						disabled={isParticipant}
						className={isParticipant ? "bg-success text-white border-success hover:bg-success/90 disabled:opacity-100" : "border-success/30 text-success hover:bg-success/10"}
						data-testid="desktop-accept-toggle"
					>
						{isParticipant ? "Accepted" : "Accept"}
					</Button>
					<Button
						size="sm"
						variant={isDeclined ? "default" : "outline"}
						leftIcon={<X size={14} />}
						onClick={isParticipant ? onWithdraw : undefined}
						disabled={isDeclined}
						className={isDeclined ? "bg-error text-white border-error hover:bg-error/90 disabled:opacity-100" : "border-error/30 text-error hover:bg-error/10"}
						data-testid="desktop-decline-toggle"
					>
						Decline
					</Button>
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
							size="sm"
							leftIcon={<X size={14} />}
							onClick={onDecline}
							className="border-error/30 text-error hover:bg-error/10"
							aria-label="Decline invitation"
							data-testid="desktop-decline-invitation-button"
						>
							Decline
						</Button>
						<Button
							size="sm"
							leftIcon={<Check size={14} />}
							onClick={onAccept}
							className="bg-success text-white border-success hover:bg-success/90"
							aria-label="Accept invitation"
							data-testid="desktop-accept-invitation-button"
						>
							Accept
						</Button>
					</>
				)}
				{isOpen && !isFull && !hasInvitation && !isParticipant && !isDeclined && !canceled && (
					isPrivate ? (
						<Button
							variant="outline"
							size="sm"
							leftIcon={<MessageCircle size={14} />}
							onClick={onMessageOrganizers}
							aria-label="Message organizers"
							data-testid="desktop-message-organizers-button"
						>
							Message Organizers
						</Button>
					) : (
						<Button
							size="sm"
							onClick={onJoin}
							aria-label="Join this event"
							data-testid="desktop-join-event-button"
						>
							Join Event
						</Button>
					)
				)}
			</div>
		</div>
	);
}
