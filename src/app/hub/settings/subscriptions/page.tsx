import UserSubscriptionSettings from "../components/UserSubscriptionSettings";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/server/auth";

async function SubscriptionSettingsPage() {
	const user = await getUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <UserSubscriptionSettings />;
}

export default SubscriptionSettingsPage;
