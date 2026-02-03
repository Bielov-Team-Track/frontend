"use client";

import { SettingsLayout, SettingsNavItem } from "@/components/layout/settings-layout";
import { AlertTriangle, Calendar, CreditCard, MapPin, Settings, Users } from "lucide-react";
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
			href: `/dashboard/events/${eventId}/settings/general`,
		},
		{
			id: "datetime",
			label: "Date & Time",
			icon: Calendar,
			href: `/dashboard/events/${eventId}/settings/datetime`,
		},
		{
			id: "location",
			label: "Location",
			icon: MapPin,
			href: `/dashboard/events/${eventId}/settings/location`,
		},
		{
			id: "registration",
			label: "Registration",
			icon: Users,
			href: `/dashboard/events/${eventId}/settings/registration`,
		},
		{
			id: "payments",
			label: "Payments",
			icon: CreditCard,
			href: `/dashboard/events/${eventId}/settings/payments`,
		},
		{
			id: "danger",
			label: "Danger Zone",
			icon: AlertTriangle,
			href: `/dashboard/events/${eventId}/settings/danger`,
			danger: true,
		},
	];

	return (
		<SettingsLayout items={navItems} activeSection={activeSection}>
			{children}
		</SettingsLayout>
	);
}
