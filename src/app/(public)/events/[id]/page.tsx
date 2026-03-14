import PositionsRealtimeClient from "@/components/features/teams/components/PositionsRealtimeClient";
import { getMyParticipation, loadEvent } from "@/lib/api/events";
import { loadTeams } from "@/lib/api/teams";
import { UserProfile } from "@/lib/models/User";
import { getUserProfile } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventDetailsV2 from "./components/EventDetailsV2";
import PaymentsSection from "./components/PaymentsSection";

type EventPageParams = {
	params: Promise<{
		id: string;
	}>;
};

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function generateMetadata({ params }: EventPageParams): Promise<Metadata> {
	const { id } = await params;

	let event = null;
	try {
		const res = await fetch(`${INTERNAL_API_URL}/events/v1/events/${id}`);
		if (res.ok) event = await res.json();
	} catch {
		/* fallback */
	}

	if (!event) {
		return { title: "Event Not Found" };
	}

	return {
		title: event.name,
		description: event.description ? event.description.slice(0, 160) : `Join ${event.name} on Spike`,
		openGraph: {
			title: event.name,
			description: event.description?.slice(0, 160),
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: event.name,
			description: event.description?.slice(0, 120),
		},
		alternates: {
			canonical: `/events/${id}`,
		},
	};
}

async function EventPage({ params }: EventPageParams) {
	const parameters = await params;
	if (!parameters || !parameters.id) {
		notFound();
	}

	const user: UserProfile | null = await getUserProfile();
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
			user={user!}
			isAdmin={true}
			teams={teams}
			userParticipant={userParticipant}
			paymentsSection={<PaymentsSection event={event} teams={teams} userProfile={user!} />}
			positionsRealtime={<PositionsRealtimeClient />}
		/>
	);
}

export default EventPage;
