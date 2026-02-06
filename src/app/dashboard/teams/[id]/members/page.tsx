"use client";

import { MembersTab } from "../components/tabs";
import { useTeamContext } from "../layout";

export default function TeamMembersPage() {
	const { team, teamId, club, clubMembers } = useTeamContext();

	if (!team) return null;

	return <MembersTab team={team} teamId={teamId} club={club} clubMembers={clubMembers} />;
}
