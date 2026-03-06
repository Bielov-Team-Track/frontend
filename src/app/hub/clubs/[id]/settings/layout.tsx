"use client";

import { SettingsLayout, SettingsNavItem } from "@/components/layout/settings-layout";
import { useClubContext } from "../layout";
import { ClubRole } from "@/lib/models/Club";
import { AlertTriangle, BarChart3, CreditCard, FileText, Settings } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function ClubSettingsLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const clubId = params.id as string;
	const { myRoles } = useClubContext();

	const isOwner = myRoles.includes(ClubRole.Owner);

	// Extract active section from pathname
	const pathParts = pathname.split("/");
	const lastPart = pathParts[pathParts.length - 1];
	// If we're at /settings, default to "general", otherwise use the last path part
	const activeSection = lastPart === "settings" ? "general" : lastPart;

	const navItems: SettingsNavItem[] = useMemo(() => {
		const items: SettingsNavItem[] = [
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
		];

		if (isOwner) {
			items.push({
				id: "danger",
				label: "Danger Zone",
				icon: AlertTriangle,
				href: `/hub/clubs/${clubId}/settings/danger`,
				danger: true,
			});
		}

		return items;
	}, [clubId, isOwner]);

	return (
		<SettingsLayout items={navItems} activeSection={activeSection}>
			{children}
		</SettingsLayout>
	);
}
