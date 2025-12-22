import { getFullUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import PlayerSettings from "../components/PlayerSettings";

async function PlayerSettingsPage() {
	const user = await getFullUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <PlayerSettings user={user} />;
}

export default PlayerSettingsPage;
