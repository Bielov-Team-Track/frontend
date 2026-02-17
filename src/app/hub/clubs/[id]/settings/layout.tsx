"use client";

import { SettingsLayout, SettingsNavItem } from "@/components/layout/settings-layout";
import { AlertTriangle, BarChart3, CreditCard, FileText, Settings } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

export default function ClubSettingsLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const clubId = params.id as string;

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
			href: `/hub/clubs/${clubId}/settings/general`,
		},
		{
			id: "registration",
			label: "Registration",
			icon: FileText,
			href: `/hub/clubs/${clubId}/settings/registration`,
		},
		{
			id: "subscriptions",
			label: "Subscriptions",
			icon: CreditCard,
			href: `/hub/clubs/${clubId}/settings/subscriptions`,
		},
		{
			id: "evaluations",
			label: "Skill Levels",
			icon: BarChart3,
			href: `/hub/clubs/${clubId}/settings/evaluations`,
		},
		{
			id: "danger",
			label: "Danger Zone",
			icon: AlertTriangle,
			href: `/hub/clubs/${clubId}/settings/danger`,
			danger: true,
		},
	];

	return (
		<SettingsLayout items={navItems} activeSection={activeSection}>
			{children}
		</SettingsLayout>
	);
}
