import React from "react";
import { loadEventsByFilter } from "@/lib/requests/events";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/server/auth";
import EventsPageClient from "./EventsPageClient";

async function EventsPage() {
	const userProfile = await getUserProfile();
	if (!userProfile) {
		redirect("/login");
	}
	const events = await loadEventsByFilter({ organizerId: userProfile.userId! });

	return <EventsPageClient events={events} />;
}

export default EventsPage;
