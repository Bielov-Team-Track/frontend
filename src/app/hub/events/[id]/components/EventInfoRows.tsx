import { Avatar } from "@/components";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { Calendar, ChevronRight, MapPin, User } from "lucide-react";
import Link from "next/link";
import { getMainOrganizer } from "../utils/getMainOrganizer";

interface EventInfoRowsProps {
	event: Event;
	participants: EventParticipant[];
}

function formatDuration(startDate: Date, endDate: Date): string {
	const totalMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h ${minutes}m`;
}

export default function EventInfoRows({ event, participants }: EventInfoRowsProps) {
	const startDate = new Date(event.startTime);
	const endDate = new Date(event.endTime);
	const duration = formatDuration(startDate, endDate);
	const relativeTime = formatDistanceToNow(startDate, { addSuffix: true });
	const isStarted = isPast(startDate);
	const organizer = getMainOrganizer(participants);
	const profile = organizer?.userProfile;

	const directionsUrl = event.location?.address
		? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location.address)}`
		: undefined;

	// Use location.name if available; fall back to splitting address by comma
	const venueName = event.location?.name || event.location?.address?.split(",")[0]?.trim() || "Unknown venue";
	const venueAddress = event.location?.name
		? event.location.address || ""
		: (event.location?.address?.split(",").slice(1).join(", ").trim() || "");

	return (
		<div className="flex flex-col lg:flex-row lg:border-b lg:border-border">
			{/* Date & Time */}
			<div className="flex items-center gap-3 px-5 py-3 border-b border-border lg:flex-1 lg:border-b-0 lg:border-r" data-testid="event-date-row">
				<div className="w-9 h-9 rounded-[10px] bg-surface flex items-center justify-center shrink-0">
					<Calendar size={16} className="text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-sm font-medium text-foreground">{format(startDate, "EEEE, MMMM d")}</div>
					<div className="text-xs text-muted">
						{format(startDate, "HH:mm")} – {format(endDate, "HH:mm")} · {duration} ·{" "}
						<span className={isStarted ? "text-warning" : "text-success"}>{relativeTime}</span>
					</div>
				</div>
			</div>

			{/* Location */}
			<div className="border-b border-border lg:flex-1 lg:border-b-0 lg:border-r" data-testid="event-location-row">
				{directionsUrl ? (
					<Link
						href={directionsUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Get directions (opens in new tab)"
						className="flex items-center gap-3 px-5 py-3 hover:bg-hover/50 transition-colors"
					>
						<div className="w-9 h-9 rounded-[10px] bg-surface flex items-center justify-center shrink-0">
							<MapPin size={16} className="text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-foreground truncate">{venueName}</div>
							{venueAddress && <div className="text-xs text-muted truncate">{venueAddress}</div>}
						</div>
						<ChevronRight size={16} className="text-muted shrink-0 lg:hidden" />
					</Link>
				) : (
					<div className="flex items-center gap-3 px-5 py-3">
						<div className="w-9 h-9 rounded-[10px] bg-surface flex items-center justify-center shrink-0">
							<MapPin size={16} className="text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-foreground">No location set</div>
						</div>
					</div>
				)}
			</div>

			{/* Host / Organizer */}
			<div className="border-b border-border lg:flex-1 lg:border-b-0" data-testid="event-host-row">
				{organizer ? (
					<Link
						href={`/profiles/${organizer.userId}`}
						className="flex items-center gap-3 px-5 py-3 hover:bg-hover/50 transition-colors"
					>
						<Avatar
							name={`${profile?.name || ""} ${profile?.surname || ""}`}
							src={profile?.imageUrl}
							size="sm"
							variant="user"
							className="w-9 h-9"
						/>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-foreground">
								{profile?.name || "Unknown"} {profile?.surname || ""}
							</div>
							<div className="text-xs text-muted">Organizer</div>
						</div>
					</Link>
				) : (
					<div className="flex items-center gap-3 px-5 py-3">
						<div className="w-9 h-9 rounded-[10px] bg-surface flex items-center justify-center shrink-0">
							<User size={16} className="text-muted" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-sm text-muted">No organizer</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
