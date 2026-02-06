import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const user = await getUserProfile();

	if (user) {
		redirect("/dashboard/events");
	} else {
		redirect("/landing");
	}
}
