"use client";

import { TeamsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubTeamsPage() {
	const { clubId, teams, members } = useClubContext();

	return <TeamsTab teams={teams} clubId={clubId} clubMembers={members} />;
}
