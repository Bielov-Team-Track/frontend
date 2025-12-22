import { getFullUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import HistorySettings from "../components/HistorySettings";

async function HistorySettingsPage() {
	const user = await getFullUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <HistorySettings user={user} />;
}

export default HistorySettingsPage;
