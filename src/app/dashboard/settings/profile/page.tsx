import { getFullUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import UserSettings from "../components/UserSettings";

async function ProfileSettingsPage() {
	const user = await getFullUserProfile();

	if (!user) {
		redirect("/login");
	}

	return (
		<div>
			<UserSettings user={user}></UserSettings>
		</div>
	);
}

export default ProfileSettingsPage;
