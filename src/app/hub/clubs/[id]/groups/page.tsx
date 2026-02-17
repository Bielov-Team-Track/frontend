"use client";

import { GroupsTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubGroupsPage() {
	const { clubId, groups, members, groupsQuery } = useClubContext();

	return (
		<GroupsTab
			groups={groups}
			clubId={clubId}
			clubMembers={members}
			hasNextPage={groupsQuery.hasNextPage}
			isFetchingNextPage={groupsQuery.isFetchingNextPage}
			fetchNextPage={groupsQuery.fetchNextPage}
		/>
	);
}
