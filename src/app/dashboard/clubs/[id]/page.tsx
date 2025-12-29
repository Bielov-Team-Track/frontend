"use client";

import { OverviewTab } from "./components/tabs";
import { useClubContext } from "./layout";

export default function ClubOverviewPage() {
	const { club, members, teams, groups, showInviteModal } = useClubContext();

	if (!club) return null;

	return <OverviewTab club={club} members={members} teams={teams} groups={groups} onInvite={showInviteModal} />;
}
