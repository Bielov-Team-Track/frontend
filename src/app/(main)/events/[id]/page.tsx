import { ApprovalSection } from "@/components/features/events";
import PositionsRealtimeClient from "@/components/features/teams/components/PositionsRealtimeClient";
import { checkUserApproval } from "@/lib/api/approvals";
import { loadEvent } from "@/lib/api/events";
import { loadTeams } from "@/lib/api/teams";
import { getUserProfile } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import { UserProfile } from "@/lib/models/User";
import PaymentsSection from "./components/PaymentsSection";
import EventDetailsV2 from "./components/EventDetailsV2";

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

	const isAdmin = !!event.admins!.find((a) => a.userId == user?.userId);

	if ((event as any).approveGuests && !isAdmin) {
		const userApproval = await checkUserApproval(event.id!, user?.userId!);

		if (!userApproval || !userApproval.approved) {
			return (
				<ApprovalSection
					defaultApproval={userApproval}
					userId={user?.userId!}
					eventId={event.id!}
				/>
			);
		}
	}

	const teams = await loadTeams(parameters.id);
	teams.forEach((team) => {
		team.event = event;
	});

	return (
		<EventDetailsV2
			event={event}
			user={user}
			isAdmin={isAdmin}
			teams={teams}
			paymentsSection={
				<PaymentsSection event={event} teams={teams} userProfile={user} />
			}
			positionsRealtime={<PositionsRealtimeClient />}
		/>
	);
}

export default EventPage;