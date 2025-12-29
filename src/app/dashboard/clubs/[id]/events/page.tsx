"use client";

import { EventsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubEventsPage() {
	const { clubId, teams, groups } = useClubContext();

	return <EventsTab clubId={clubId} teams={teams} groups={groups} />;
}
