"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { Club } from "@/lib/models/Club";

interface EventsTabProps {
	club: Club;
}

export default function EventsTab({ club }: EventsTabProps) {
	return <EventsDisplay contextType="club" contextId={club.id} contextName={club.name} />;
}
