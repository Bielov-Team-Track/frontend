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
		<>
			{/* Mobile: Horizontal scrollable tabs */}
			<nav className="md:hidden overflow-x-auto no-scrollbar border-b border-white/10 -mx-4 px-4">
				<div className="flex gap-1 min-w-max pb-px">
					{navItems.map((item) => {
						const active = activeSection === item.id;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
									active
										? "border-accent text-accent"
										: "border-transparent text-muted hover:text-white hover:border-white/20"
								)}>
								<item.icon size={16} />
								{item.label}
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Desktop: Vertical sidebar */}
			<nav className="hidden md:block w-52 shrink-0">
				<div className="sticky top-24 space-y-1">
					{navItems.map((item) => {
						const active = activeSection === item.id;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={cn(
									"flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
									active
										? "bg-accent/20 text-accent"
										: "text-muted hover:bg-white/5 hover:text-white"
								)}>
								<item.icon size={18} />
								{item.label}
							</Link>
						);
					})}
				</div>
			</nav>
		</>
	);
}
