import { getUserProfile } from "@/lib/server/auth";
import { loadEventsByFilterServer } from "@/lib/server/events";
import { redirect } from "next/navigation";
import EventsPageClient from "./EventsPageClient";

async function EventsPage() {
	const userProfile = await getUserProfile();
	if (!userProfile) {
		redirect("/login");
	}
	const events = await loadEventsByFilterServer({ organizerId: userProfile.id! });

	return <EventsPageClient events={events} title="Your Events" />;
}

export default EventsPage;
