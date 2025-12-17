"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { TeamEventFormModal } from "@/components/features/teams";
import { TeamEvent } from "@/components/features/teams/types";

export default function EventsTab() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [events, setEvents] = useState<TeamEvent[]>([]);

	const handleCreateEvent = (event: Omit<TeamEvent, "id" | "createdAt">) => {
		const newEvent: TeamEvent = {
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

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Team Events</h3>
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
					description="Create events for your team"
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
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			<TeamEventFormModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreateEvent}
			/>
		</div>
	);
}
