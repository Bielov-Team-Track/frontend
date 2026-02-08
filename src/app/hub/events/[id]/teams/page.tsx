"use client";

import { TeamsList } from "@/components/features/teams";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { Users } from "lucide-react";
import { useEventContext } from "../layout";

export default function EventTeamsPage() {
	const { event, teams } = useEventContext();

	if (!event) return null;

	const totalParticipants = teams.reduce(
		(sum, t) => sum + (t.positions?.filter((p) => p.eventParticipant).length || 0),
		0
	);
	const totalSpots = teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0);

	// Assign event to teams (needed for Team component)
	const teamsWithEvent = teams.map((team) => ({
		...team,
		event: event,
	}));

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">Teams</h2>
					<p className="text-sm text-muted">
						{teams.length} teams · {totalParticipants}/{totalSpots} players registered
					</p>
				</div>
			</div>

			{/* Teams Grid */}
			{teamsWithEvent && teamsWithEvent.length > 0 ? (
				<TeamsList
					teams={teamsWithEvent}
					userId=""
					isAdmin={true}
					registrationType={event.registrationUnit || Unit.Individual}
				/>
			) : (
				<div className="rounded-2xl bg-surface border border-border p-12 text-center">
					<Users className="w-16 h-16 mx-auto mb-4 text-muted/30" />
					<h3 className="text-lg font-bold text-white mb-2">No Teams Yet</h3>
					<p className="text-muted text-sm">Teams will appear here once they register for the event.</p>
				</div>
			)}
		</div>
	);
}
