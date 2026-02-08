"use client";

import EventsPageClient from "@/app/hub/events/EventsPageClient";
import { Loader } from "@/components";
import EmptyState from "@/components/ui/empty-state";
import { loadEventsByFilter } from "@/lib/api/events";
import { Club, Group, Team } from "@/lib/models/Club";
import { ContextType } from "@/lib/models/shared/models";
import { useCreateModals } from "@/providers/CreateModalsProvider";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus } from "lucide-react";

interface EventsDisplayProps {
	contextType: ContextType;
	contextId: string;
	contextName?: string;
	/** Full context object for pre-selecting in create modal */
	context?: Club | Group | Team;
}

/**
 * Shared component for displaying events filtered by context (club, team, or group).
 * Handles fetching, loading states, empty states, and event creation.
 */
export default function EventsDisplay({ contextType, contextId, contextName, context }: EventsDisplayProps) {
	const { openCreateEvent } = useCreateModals();

	const {
		data: events,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["events", contextType, contextId],
		queryFn: () =>
			loadEventsByFilter({
				contextId,
				contextType,
			}),
		enabled: !!contextId,
	});

	const handleCreateEvent = () => {
		openCreateEvent({
			source: contextType,
			clubId: contextType === "club" ? contextId : undefined,
			teamId: contextType === "team" ? contextId : undefined,
			groupId: contextType === "group" ? contextId : undefined,
			// Pass full context selection if context object is provided
			contextSelection: context ? { context, contextType } : undefined,
		});
	};

	const getContextLabel = () => {
		if (contextName) return contextName;
		return contextType;
	};

	if (isLoading) {
		return (
			<div className="flex gap-4 items-center justify-center py-12">
				<Loader className="h-12 w-12" />
				<span className="text-muted-foreground">Loading events...</span>
			</div>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon={Calendar}
				title="Failed to load events"
				description="There was an error loading events. Please try again."
				action={{
					label: "Retry",
					onClick: () => window.location.reload(),
					icon: Calendar,
				}}
			/>
		);
	}

	if (!events || events.length === 0) {
		return (
			<EmptyState
				icon={Calendar}
				title="No events yet"
				description={`Create events for your ${getContextLabel()}`}
				action={{
					label: "Create Event",
					onClick: handleCreateEvent,
					icon: Plus,
				}}
			/>
		);
	}

	const getTitle = () => {
		switch (contextType) {
			case "club":
				return "Club Events";
			case "team":
				return "Team Events";
			case "group":
				return "Group Events";
			default:
				return "Events";
		}
	};

	return <EventsPageClient events={events} title={getTitle()} />;
}
