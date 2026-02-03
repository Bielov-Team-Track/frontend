"use client";

import { EventsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubEventsPage() {
	const { club } = useClubContext();

	return <EventsTab club={club!} />;
}
