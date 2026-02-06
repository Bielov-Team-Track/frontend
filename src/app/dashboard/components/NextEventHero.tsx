"use client";

import { Badge, Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import { Calendar, Clock, CreditCard, MapPin, Plus, Search, Users } from "lucide-react";
import Link from "next/link";

interface NextEventHeroProps {
	event: Event | null;
	isHosting: boolean;
	participant?: EventParticipant | null;
	participantCount?: number;
	maxParticipants?: number;
}

function getTimeUntilEvent(startTime: Date): string {
	const now = new Date();
	const start = new Date(startTime);
	const diffMs = start.getTime() - now.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

	if (diffDays < 0) return "PAST";
	if (diffDays === 0 && diffHours < 24) {
		if (diffHours <= 0) return "NOW";
		return "TODAY";
	}
	if (diffDays === 1) return "TOMORROW";
	if (diffDays <= 7) return `IN ${diffDays} DAYS`;
	return `IN ${Math.ceil(diffDays / 7)} WEEKS`;
}

export function NextEventHero({ event, isHosting, participant, participantCount = 0, maxParticipants }: NextEventHeroProps) {
	if (!event) {
		return <EmptyState />;
	}

	const startDate = new Date(event.startTime);
	const timeUntil = getTimeUntilEvent(startDate);
	const paymentStatus = participant?.payment?.status;
	const amountDue = event.budget?.cost || event.costToEnter || 0;
	const isUnpaid = amountDue > 0 && paymentStatus !== "completed";

	return (
		<div className="relative rounded-2xl bg-surface border border-border overflow-hidden group hover:border-border transition-all duration-300">
			{/* Accent Glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
			<div className="absolute top-0 right-0 w-1/3 h-1/2 bg-accent/5 blur-3xl rounded-full" />

			<div className="relative p-6">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Date Block - Large and Prominent */}
					<div className="flex-shrink-0 lg:w-32 xl:w-40">
						<div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 p-4 text-center">
							<div className="text-accent text-sm font-bold mb-1 uppercase tracking-wider">{timeUntil}</div>
							<div className="text-white text-4xl font-bold mb-1">
								{startDate.toLocaleDateString(undefined, { day: "numeric" })}
							</div>
							<div className="text-white/70 text-sm font-medium">
								{startDate.toLocaleDateString(undefined, { month: "short" })}
							</div>
							<div className="text-muted text-xs mt-2">
								{startDate.toLocaleDateString(undefined, { weekday: "long" })}
							</div>
						</div>
					</div>

					{/* Event Details */}
					<div className="flex-1 min-w-0">
						{/* Badges Row */}
						<div className="flex items-center gap-2 mb-3">
							{isHosting && (
								<Badge variant="solid" color="accent" className="text-xs font-semibold bg-accent/20 text-accent border-accent/30">
									HOSTING
								</Badge>
							)}
							{isUnpaid && (
								<Badge variant="solid" color="error" className="gap-1 text-xs font-semibold">
									<CreditCard className="size-3" />
									${amountDue} UNPAID
								</Badge>
							)}
						</div>

						{/* Event Name */}
						<h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 line-clamp-2">{event.name}</h2>

						{/* Event Metadata Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
							<div className="flex items-center gap-2.5 text-sm text-white/80">
								<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-hover flex items-center justify-center">
									<Clock className="size-4 text-accent" />
								</div>
								<span>
									{startDate.toLocaleTimeString(undefined, {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>

							{event.location && (
								<div className="flex items-center gap-2.5 text-sm text-white/80">
									<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-hover flex items-center justify-center">
										<MapPin className="size-4 text-accent" />
									</div>
									<span className="truncate">{event.location.name}</span>
								</div>
							)}

							{maxParticipants && (
								<div className="flex items-center gap-2.5 text-sm text-white/80">
									<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-hover flex items-center justify-center">
										<Users className="size-4 text-accent" />
									</div>
									<span>
										{participantCount}/{maxParticipants} players
									</span>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex flex-wrap gap-3">
							<Button asChild className="font-semibold">
								<Link href={`/dashboard/events/${event.id}`}>View Event Details</Link>
							</Button>
							{isUnpaid && (
								<Button variant="secondary" asChild className="font-semibold">
									<Link href={`/dashboard/events/${event.id}/payments`}>Pay Now</Link>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="rounded-2xl bg-surface border border-border border-dashed">
			<div className="py-16 px-6 text-center">
				<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
					<Calendar className="size-10 text-muted" />
				</div>
				<h3 className="text-xl font-bold text-white mb-3">No upcoming events</h3>
				<p className="text-sm text-muted mb-8 max-w-md mx-auto">
					Join a club or create an event to start playing volleyball with the community
				</p>
				<div className="flex flex-col sm:flex-row justify-center gap-3">
					<Button variant="outline" asChild className="font-semibold">
						<Link href="/clubs">
							<Search className="size-4 mr-2" />
							Browse Clubs
						</Link>
					</Button>
					<Button asChild className="font-semibold">
						<Link href="/dashboard/events/create">
							<Plus className="size-4 mr-2" />
							Create Event
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
