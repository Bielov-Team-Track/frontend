"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { useMemo } from "react";
import { useTeamContext } from "../../layout";

export default function EventsTab() {
	const { team, teamId, club } = useTeamContext();

	// Build team object with club attached for context selection
	const teamWithClub = useMemo(() => {
		if (!team) return undefined;
		return { ...team, club };
	}, [team, club]);

	return <EventsDisplay contextType="team" contextId={teamId} contextName={team?.name} context={teamWithClub} />;
}
