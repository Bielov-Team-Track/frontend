"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { useTeamContext } from "../../layout";

export default function EventsTab() {
	const { team, teamId } = useTeamContext();

	return <EventsDisplay contextType="team" contextId={teamId} contextName={team?.name} />;
}
