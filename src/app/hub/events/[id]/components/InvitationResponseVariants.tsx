"use client";

import { Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { format } from "date-fns";
import { Calendar, Check, X } from "lucide-react";

interface InvitationSidebarCardProps {
	event: Event;
	invitedBy: string;
	isSubscriptionCovered?: boolean;
	onAccept: () => void;
	onDecline: (note?: string) => void;
}

export function InvitationSidebarCard({ event, invitedBy, isSubscriptionCovered, onAccept, onDecline }: InvitationSidebarCardProps) {
	const startDate = new Date(event.startTime);

	return (
		<div className="rounded-2xl bg-accent/10 border border-accent/30 p-6">
			<div className="flex items-start gap-3 mb-4">
				<div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
					<Calendar size={20} className="text-accent" />
				</div>
				<div>
					<h3 className="font-semibold text-white">You're Invited!</h3>
					<p className="text-sm text-muted">
						{invitedBy} invited you to this event
					</p>
				</div>
			</div>

			<div className="text-sm text-muted mb-4">
				<p>{format(startDate, "EEEE, MMMM d, yyyy")}</p>
				<p>{format(startDate, "h:mm a")}</p>
				{isSubscriptionCovered && (
					<p className="text-emerald-500 text-xs mt-1 font-medium">Covered by your subscription</p>
				)}
			</div>

			<div className="flex gap-2">
				<Button
					color="primary"
					className="flex-1"
					leftIcon={<Check size={16} />}
					onClick={onAccept}
				>
					Accept
				</Button>
				<Button
					variant="outline"
					color="neutral"
					className="flex-1"
					leftIcon={<X size={16} />}
					onClick={() => onDecline()}
				>
					Decline
				</Button>
			</div>
		</div>
	);
}
