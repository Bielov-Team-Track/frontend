"use client";

import EventsPageClient from "@/app/hub/events/EventsPageClient";
import { Club, Group, Team } from "@/lib/models/Club";
import { ContextType } from "@/lib/models/shared/models";

interface EventsDisplayProps {
	contextType: ContextType;
	contextId: string;
	contextName?: string;
	/** Full context object for pre-selecting in create modal */
	context?: Club | Group | Team;
}

/**
 * Shared component for displaying events filtered by context (club, team, or group).
 * Delegates fetching and filtering to EventsPageClient via baseFilter.
 */
export default function EventsDisplay({ contextType, contextId, context }: EventsDisplayProps) {
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

	return (
		<EventsPageClient
			baseFilter={{ contextId, contextType }}
			title={getTitle()}
			defaultContext={context ? { context, contextType } : undefined}
		/>
	);
}
