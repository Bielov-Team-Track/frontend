import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage() {
	const userProfile = await getUserProfile();
	if (!userProfile) {
		redirect("/login");
	}

	return <AttendanceClient userId={userProfile.id!} />;
}
