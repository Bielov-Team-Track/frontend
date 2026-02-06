"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface SettingsNavItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
	danger?: boolean;
}

interface SettingsSidebarProps {
	items: SettingsNavItem[];
	activeSection: string;
}

export function SettingsSidebar({ items, activeSection }: SettingsSidebarProps) {
	return (
		<>
			{/* Desktop Sidebar */}
			<nav className="hidden md:block w-56 shrink-0">
				<div className="sticky top-4 space-y-1">
					{items.map((item) => {
						const isActive = activeSection === item.id;
						const Icon = item.icon;

						return (
							<Link
								key={item.id}
								href={item.href}
								className={cn(
									"flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
									isActive
										? item.danger
											? "bg-red-500/20 text-red-400"
											: "bg-track text-foreground"
										: item.danger
											? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
											: "text-muted hover:bg-hover hover:text-foreground"
								)}>
								<Icon size={18} />
								{item.label}
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Mobile Tabs */}
			<div className="md:hidden overflow-x-auto -mx-4 px-4 mb-6">
				<div className="flex gap-2 min-w-max">
					{items.map((item) => {
						const isActive = activeSection === item.id;
						const Icon = item.icon;

						return (
							<Link
								key={item.id}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
									isActive
										? item.danger
											? "bg-red-500/20 text-red-400"
											: "bg-track text-foreground"
										: item.danger
											? "text-red-400/70 hover:bg-red-500/10"
											: "text-muted hover:bg-hover"
								)}>
								<Icon size={16} />
								{item.label}
							</Link>
						);
					})}
				</div>
			</div>
		</>
	);
}
