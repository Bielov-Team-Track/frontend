"use client";

import { SettingsLayout, SettingsNavItem } from "@/components/layout/settings-layout";
import { AlertTriangle, Settings, Users } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

export default function EventSettingsLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const eventId = params.id as string;

	// Extract active section from pathname
	const pathParts = pathname.split("/");
	const lastPart = pathParts[pathParts.length - 1];
	// If we're at /settings, default to "general", otherwise use the last path part
	const activeSection = lastPart === "settings" ? "general" : lastPart;

	const navItems: SettingsNavItem[] = [
		{
			id: "general",
			label: "General",
			icon: Settings,
			href: `/dashboard/events/${eventId}/prototype/settings/general`,
		},
		{
			id: "registration",
			label: "Registration",
			icon: Users,
			href: `/dashboard/events/${eventId}/prototype/settings/registration`,
		},
		{
			id: "danger",
			label: "Danger Zone",
			icon: AlertTriangle,
			href: `/dashboard/events/${eventId}/prototype/settings/danger`,
			danger: true,
		},
	];

	return (
		<SettingsLayout items={navItems} activeSection={activeSection}>
			{children}
		</SettingsLayout>
	);
}
