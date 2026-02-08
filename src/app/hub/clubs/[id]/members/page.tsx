"use client";

import { MembersTab } from "../components/tabs";
import { useClubContext } from "../layout";

export default function ClubMembersPage() {
	const { clubId, members, showInviteModal } = useClubContext();

	return <MembersTab members={members} clubId={clubId} onInvite={showInviteModal} />;
}
