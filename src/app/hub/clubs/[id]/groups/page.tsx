"use client";

import { GroupsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubGroupsPage() {
	const { clubId, groups, members } = useClubContext();

	return <GroupsTab groups={groups} clubId={clubId} clubMembers={members} />;
}
