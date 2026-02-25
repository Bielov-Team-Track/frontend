"use client";

import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";

interface ParticipationStatusChipsProps {
	participants: EventParticipant[];
}

const RESOLVED_STATUSES = new Set([ParticipationStatus.Accepted, ParticipationStatus.Attended]);

const statusConfig = [
	{
		status: ParticipationStatus.Invited,
		label: "Pending",
		className: "bg-warning/10 text-warning border-warning/20",
	},
	{
		status: ParticipationStatus.Accepted,
		label: "Accepted",
		className: "bg-success/10 text-success border-success/20",
	},
	{
		status: ParticipationStatus.Waitlisted,
		label: "Waitlist",
		className: "bg-primary/10 text-primary border-primary/20",
	},
	{
		status: ParticipationStatus.Declined,
		label: "Declined",
		className: "bg-error/10 text-[#d46b56] border-error/20",
	},
	{
		status: ParticipationStatus.Attended,
		label: "Attended",
		className: "bg-success/10 text-success border-success/20",
	},
	{
		status: ParticipationStatus.NoShow,
		label: "No Show",
		className: "bg-error/10 text-error/60 border-error/15",
	},
] as const;

export default function ParticipationStatusChips({ participants }: ParticipationStatusChipsProps) {
	const counts = statusConfig
		.map(({ status, label, className }) => ({
			status,
			label,
			className,
			count: participants.filter((p) => p.status === status).length,
		}))
		.filter((item) => item.count > 0);

	if (counts.length === 0) return null;

	// Hide chips when only "resolved" statuses (Accepted, Attended) are present.
	const allResolved = counts.every((item) => RESOLVED_STATUSES.has(item.status));
	if (allResolved) return null;

	return (
		<div className="flex items-center gap-2 flex-wrap px-5 py-2.5 lg:py-0" aria-label="Participation status summary" data-testid="participation-status-chips">
			{counts.map(({ label, className, count }) => (
				<span
					key={label}
					data-testid={`status-chip-${label.toLowerCase().replace(' ', '-')}`}
					className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${className}`}
				>
					<span className="font-bold">{count}</span> {label}
				</span>
			))}
		</div>
	);
}
