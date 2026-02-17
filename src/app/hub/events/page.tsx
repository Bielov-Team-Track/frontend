import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import EventsPageClient from "./EventsPageClient";

async function EventsPage() {
	const userProfile = await getUserProfile();
	if (!userProfile) {
		redirect("/login");
	}

	return <EventsPageClient baseFilter={{ organizerId: userProfile.id! }} title="Your Events" />;
}

export default EventsPage;
