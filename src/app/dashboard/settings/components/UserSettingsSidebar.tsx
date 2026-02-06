"use client";

import { cn } from "@/lib/utils";
import { Activity, ClipboardList, CreditCard, History, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type UserSettingsSection = "profile" | "player" | "coach" | "history" | "payments";

interface NavItem {
	id: UserSettingsSection;
	label: string;
	icon: React.ComponentType<{ size?: number }>;
	href: string;
}

const navItems: NavItem[] = [
	{
		id: "profile",
		label: "Basic Info",
		icon: User,
		href: "/dashboard/settings/profile",
	},
	{
		id: "player",
		label: "Player Profile",
		icon: Activity,
		href: "/dashboard/settings/player",
	},
	{
		id: "coach",
		label: "Coach Profile",
		icon: ClipboardList,
		href: "/dashboard/settings/coach",
	},
	{
		id: "history",
		label: "History",
		icon: History,
		href: "/dashboard/settings/history",
	},
	{
		id: "payments",
		label: "Payments",
		icon: CreditCard,
		href: "/dashboard/settings/payments",
	},
];

export default function UserSettingsSidebar() {
	const pathname = usePathname();

	const getActiveSection = (): UserSettingsSection => {
		if (pathname.includes("/settings/player")) return "player";
		if (pathname.includes("/settings/coach")) return "coach";
		if (pathname.includes("/settings/history")) return "history";
		if (pathname.includes("/settings/payments")) return "payments";
		return "profile";
	};

	const activeSection = getActiveSection();

	return (
		<nav className="overflow-x-auto no-scrollbar">
			<div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-elevated min-w-max">
				{navItems.map((item) => {
					const active = activeSection === item.id;
					return (
						<Link
							key={item.id}
							href={item.href}
							className={cn(
								"flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
								active
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}>
							<item.icon size={16} />
							{item.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
