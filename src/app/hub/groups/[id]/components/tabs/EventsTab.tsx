"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { useMemo } from "react";
import { useGroupContext } from "../../layout";

export default function EventsTab() {
	const { group, groupId, club } = useGroupContext();

	// Build group object with club attached for context selection
	const groupWithClub = useMemo(() => {
		if (!group) return undefined;
		return { ...group, club };
	}, [group, club]);

	return <EventsDisplay contextType="group" contextId={groupId} contextName={group?.name} context={groupWithClub} />;
}
