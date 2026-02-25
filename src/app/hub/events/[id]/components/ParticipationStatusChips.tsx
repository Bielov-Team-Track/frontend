"use client";

import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import Link from "next/link";

interface ParticipationStatusChipsProps {
	participants: EventParticipant[];
	eventId: string;
	isPrivate: boolean;
}

const statusConfig = [
	{
		status: ParticipationStatus.Invited,
		label: "Invited",
		className: "bg-info/20 text-info border-info/30",
	},
	{
		status: ParticipationStatus.Accepted,
		label: "Accepted",
		className: "bg-success/20 text-success border-success/30",
	},
	{
		status: ParticipationStatus.Waitlisted,
		label: "Waitlisted",
		className: "bg-warning/20 text-warning border-warning/30",
	},
	{
		status: ParticipationStatus.Declined,
		label: "Declined",
		className: "bg-error/20 text-error border-error/30",
	},
	{
		status: ParticipationStatus.Attended,
		label: "Attended",
		className: "bg-success/20 text-success border-success/30",
	},
	{
		status: ParticipationStatus.NoShow,
		label: "No Show",
		className: "bg-error/20 text-error border-error/30",
	},
] as const;

// For private events, always show these statuses (even if count is 0)
const PRIVATE_STATUSES = new Set([
	ParticipationStatus.Invited,
	ParticipationStatus.Accepted,
	ParticipationStatus.Declined,
	ParticipationStatus.Waitlisted,
]);

export default function ParticipationStatusChips({ participants, eventId, isPrivate }: ParticipationStatusChipsProps) {
	const allCounts = statusConfig.map(({ status, label, className }) => ({
		status,
		label,
		className,
		count: participants.filter((p) => p.status === status).length,
	}));

	let visibleChips: typeof allCounts;

	if (isPrivate) {
		// Private events: show all key statuses (Invited, Accepted, Declined, Waitlisted) + any others with count > 0
		visibleChips = allCounts.filter(
			(item) => PRIVATE_STATUSES.has(item.status) || item.count > 0
		);
	} else {
		// Public events: only show statuses that have participants
		visibleChips = allCounts.filter((item) => item.count > 0);
	}

	if (visibleChips.length === 0) return null;

	return (
		<div className="flex items-center gap-2 flex-wrap px-5 py-2.5 lg:py-0" aria-label="Participation status summary" data-testid="participation-status-chips">
			{visibleChips.map(({ status, label, className, count }) => (
				<Link
					key={label}
					href={`/hub/events/${eventId}/members?status=${status}`}
					data-testid={`status-chip-${label.toLowerCase().replace(' ', '-')}`}
					className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${className}`}
				>
					<span className="font-bold">{count}</span> {label}
				</Link>
			))}
		</div>
	);
}
