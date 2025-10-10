"use client";

import { loadTeams } from "@/lib/requests/teams";
import { Event } from "@/lib/models/Event";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui";
import { Team as TeamComponent } from "../../teams";
import { Team } from "@/lib/models/Team";

type AuditTeamsListProps = {
	event: Event;
};

const AuditTeamsList = ({ event }: AuditTeamsListProps) => {
	const [teams, setTeams] = useState<Team[]>([]);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		loadTeams(event.id, true).then((data) => {
			data.forEach((team) => {
				team.event = event; // Attach event to each team
			});
			setTeams(data);
			setLoading(false);
		});
	}, [event, event.id]);

	return (
		<div>
			{isLoading ? (
				<div className="flex justify-center items-center">
					<Loader />
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<div>
						{teams.length === 0 ? (
							<div>No teams registered.</div>
						) : (
							<div className="flex gap-4 flex-wrap">
								{teams.map(
									(team) =>
										team.positions &&
										team.positions.some(
											(p) => !!p.eventParticipant?.userProfile,
										) && (
											<TeamComponent
												key={team.id}
												team={team}
												audit={true}
												editable={false}
											/>
										),
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AuditTeamsList;
