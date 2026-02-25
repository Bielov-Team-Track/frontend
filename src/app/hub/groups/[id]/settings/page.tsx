"use client";

import { SettingsTab } from "../components/tabs";
import { useGroupContext } from "../layout";

export default function GroupSettingsPage() {
	const { group, permissions } = useGroupContext();

	if (!group) return null;

	return <SettingsTab group={group} clubId={group.clubId} permissions={permissions} />;
}
