import PositionsRealtimeClient from "@/components/features/teams/components/PositionsRealtimeClient";
import { getMyParticipation, loadEvent } from "@/lib/api/events";
import { loadTeams } from "@/lib/api/teams";
import { UserProfile } from "@/lib/models/User";
import { getUserProfile } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import EventDetailsV2 from "./components/EventDetailsV2";
import PaymentsSection from "./components/PaymentsSection";

type EventPageParams = {
	params: Promise<{
		id: string;
	}>;
};

async function EventPage({ params }: EventPageParams) {
	const parameters = await params;
	if (!parameters || !parameters.id) {
		notFound();
	}

	const user: UserProfile = await getUserProfile();
	const event = await loadEvent(parameters.id);

	if (!event) {
		notFound();
	}

	const [teams, userParticipant] = await Promise.all([
		loadTeams(parameters.id),
		user?.id ? getMyParticipation(parameters.id) : Promise.resolve(null),
	]);
	teams.forEach((team) => {
		team.event = event;
	});

	return (
		<EventDetailsV2
			event={event}
			user={user}
			isAdmin={true}
			teams={teams}
			userParticipant={userParticipant}
			paymentsSection={<PaymentsSection event={event} teams={teams} userProfile={user} />}
			positionsRealtime={<PositionsRealtimeClient />}
		/>
	);
}

export default EventPage;
