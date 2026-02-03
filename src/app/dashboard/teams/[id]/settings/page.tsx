"use client";

import { SettingsTab } from "../components/tabs";
import { useTeamContext } from "../layout";

export default function TeamSettingsPage() {
	const { team } = useTeamContext();

	if (!team) return null;

	return <SettingsTab team={team} clubId={team.clubId} />;
}
