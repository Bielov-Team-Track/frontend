"use client";

import { EventsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubEventsPage() {
	const { club, teams, groups } = useClubContext();

	return <EventsTab club={club!} teams={teams} groups={groups} />;
}
