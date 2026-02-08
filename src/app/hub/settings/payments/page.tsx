import PaymentSettings from "../components/PaymentSettings";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/server/auth";

async function PaymentSettingsPage() {
	const user = await getUserProfile();

	if (!user) {
		redirect("/login");
	}

	return <PaymentSettings user={user} />;
}

export default PaymentSettingsPage;
