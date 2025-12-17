"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, Settings } from "lucide-react";

interface SettingsSidebarProps {
	clubId: string;
	onTabChange?: (tabId: SettingsSection) => void;
	activeTab?: SettingsSection;
}

export type SettingsSection = "general" | "registration" | "danger";

const navItems = [
	{
		id: "general",
		label: "General",
		icon: Settings,
		href: (clubId: string) => `/dashboard/clubs/${clubId}/settings/general`,
	},
	{
		id: "registration",
		label: "Registration",
		icon: FileText,
		href: (clubId: string) => `/dashboard/clubs/${clubId}/settings/registration`,
	},
	{
		id: "danger",
		label: "Danger Zone",
		icon: AlertTriangle,
		href: (clubId: string) => `/dashboard/clubs/${clubId}/settings/danger`,
		danger: true,
	},
];

export default function SettingsSidebar({ onTabChange, activeTab }: SettingsSidebarProps) {
	return (
		<nav className="w-52 shrink-0">
			<div className="sticky top-0 space-y-1">
				{navItems.map((item) => {
					const active = activeTab === item.id;

					return (
						<button
							key={item.id}
							onClick={() => {
								onTabChange?.(item.id as SettingsSection);
							}}
							className={cn(
								"flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
								active
									? item.danger
										? "bg-red-500/20 text-red-400"
										: "bg-accent/20 text-accent"
									: item.danger
									? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
									: "text-muted hover:bg-white/5 hover:text-white"
							)}>
							<item.icon size={18} />
							{item.label}
						</button>
					);
				})}
			</div>
		</nav>
	);
}
