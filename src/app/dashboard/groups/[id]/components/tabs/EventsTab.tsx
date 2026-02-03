"use client";

import EventsDisplay from "@/components/features/events/EventsDisplay";
import { useGroupContext } from "../../layout";

export default function EventsTab() {
	const { group, groupId } = useGroupContext();

	return <EventsDisplay contextType="group" contextId={groupId} contextName={group?.name} />;
}
