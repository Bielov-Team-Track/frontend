"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { Club } from "@/lib/models/Club";

interface EventsTabProps {
	club: Club;
	canCreateEvent?: boolean;
}

export default function EventsTab({ club, canCreateEvent }: EventsTabProps) {
	return <EventsDisplay contextType="club" contextId={club.id} contextName={club.name} context={club} canCreate={canCreateEvent} />;
}
