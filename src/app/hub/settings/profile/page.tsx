import { getFullUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import BasicInfoSettings from "../components/BasicInfoSettings";

async function ProfileSettingsPage() {
	const user = await getFullUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <BasicInfoSettings user={user} />;
}

export default ProfileSettingsPage;
