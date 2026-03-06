"use client";

import { EventsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubEventsPage() {
	const { club, permissions } = useClubContext();

	return <EventsTab club={club!} canCreateEvent={permissions.canCreateEvent} />;
}
