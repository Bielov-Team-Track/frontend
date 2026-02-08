import { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
	title: "Notifications | Spike",
	description: "View and manage your notifications",
};

export default function NotificationsPage() {
	return <NotificationsClient />;
}
