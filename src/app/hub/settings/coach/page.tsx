import { getFullUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import CoachSettings from "../components/CoachSettings";

async function CoachSettingsPage() {
	const user = await getFullUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <CoachSettings user={user} />;
}

export default CoachSettingsPage;
