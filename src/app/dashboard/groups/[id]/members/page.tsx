"use client";

import { MembersTab } from "../components/tabs";
import { useGroupContext } from "../layout";

export default function GroupMembersPage() {
	const { group, groupId } = useGroupContext();

	if (!group) return null;

	return <MembersTab group={group} groupId={groupId} />;
}
