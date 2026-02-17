"use client";

import { TeamsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubTeamsPage() {
	const { clubId, teams, members, teamsQuery } = useClubContext();

	return (
		<TeamsTab
			teams={teams}
			clubId={clubId}
			clubMembers={members}
			hasNextPage={teamsQuery.hasNextPage}
			isFetchingNextPage={teamsQuery.isFetchingNextPage}
			fetchNextPage={teamsQuery.fetchNextPage}
		/>
	);
}
