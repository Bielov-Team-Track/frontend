"use client";

import { SettingsLayout, SettingsNavItem } from "@/components/layout/settings-layout";
import { AlertTriangle, Settings } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

export default function TeamSettingsLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const teamId = params.id as string;

	const pathParts = pathname.split("/");
	const lastPart = pathParts[pathParts.length - 1];
	const activeSection = lastPart === "settings" ? "general" : lastPart;

	const navItems: SettingsNavItem[] = [
		{
			id: "general",
			label: "General",
			icon: Settings,
			href: `/dashboard/teams/${teamId}/settings/general`,
		},
		{
			id: "danger",
			label: "Danger Zone",
			icon: AlertTriangle,
			href: `/dashboard/teams/${teamId}/settings/danger`,
			danger: true,
		},
	];

	return (
		<SettingsLayout items={navItems} activeSection={activeSection}>
			{children}
		</SettingsLayout>
	);
}
