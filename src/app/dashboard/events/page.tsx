import { loadEventsByFilter } from "@/lib/api/events";
import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
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
