"use client";

import { RosterTab } from "../components/tabs";
import { useTeamContext } from "../layout";

export default function TeamRosterPage() {
	const { team, teamId, clubMembers, club } = useTeamContext();

	if (!team) return null;

	return <RosterTab team={team} clubMembers={clubMembers} teamId={teamId} club={club} />;
}
