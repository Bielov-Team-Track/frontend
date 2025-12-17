"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Users } from "lucide-react";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import ClubEventFormModal, {
	ClubEvent,
} from "@/components/features/clubs/forms/ClubEventFormModal";
import { Team, Group } from "@/lib/models/Club";

interface EventsTabProps {
	clubId: string;
	teams: Team[];
	groups: Group[];
}

export default function EventsTab({ clubId, teams, groups }: EventsTabProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [events, setEvents] = useState<ClubEvent[]>([]);

	const handleCreateEvent = (event: Omit<ClubEvent, "id" | "createdAt">) => {
		const newEvent: ClubEvent = {
			...event,
			id: crypto.randomUUID(),
			createdAt: new Date(),
		};
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const formatDateTime = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const getTargetLabel = (event: ClubEvent) => {
		if (event.targetType === "all") return "All Members";
		if (event.targetType === "teams") {
			const targetTeams = teams.filter((t) =>
				event.targetTeamIds?.includes(t.id)
			);
			return targetTeams.map((t) => t.name).join(", ") || "Selected Teams";
		}
		if (event.targetType === "groups") {
			const targetGroups = groups.filter((g) =>
				event.targetGroupIds?.includes(g.id)
			);
			return targetGroups.map((g) => g.name).join(", ") || "Selected Groups";
		}
		return "Custom Selection";
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Club Events</h3>
				<Button
					variant="solid"
					color="accent"
					onClick={() => setShowCreateModal(true)}
					leftIcon={<Plus size={16} />}>
					Create Event
				</Button>
			</div>

			{/* Events List */}
			{events.length === 0 ? (
				<EmptyState
					icon={Calendar}
					title="No events yet"
					description="Create events for your club members, teams, or groups"
					action={{
						label: "Create Event",
						onClick: () => setShowCreateModal(true),
						icon: Plus,
					}}
				/>
			) : (
				<div className="space-y-3">
					{events.map((event) => (
						<div
							key={event.id}
							className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-accent/30 transition-colors">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<h4 className="font-bold text-white truncate">
										{event.name}
									</h4>
									{event.description && (
										<p className="text-sm text-muted line-clamp-2 mt-1">
											{event.description}
										</p>
									)}
									<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
										<div className="flex items-center gap-1.5">
											<Clock size={14} />
											<span>{formatDateTime(event.startTime)}</span>
										</div>
										{event.location && (
											<div className="flex items-center gap-1.5">
												<MapPin size={14} />
												<span>{event.location}</span>
											</div>
										)}
									</div>
								</div>
								<div className="text-right">
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
										<Users size={12} />
										{getTargetLabel(event)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			<ClubEventFormModal
				isOpen={showCreateModal}
				teams={teams}
				groups={groups}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreateEvent}
			/>
		</div>
	);
}
