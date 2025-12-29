"use client";

import { SettingsNavItem, SettingsSidebar } from "./SettingsSidebar";

interface SettingsLayoutProps {
	items: SettingsNavItem[];
	activeSection: string;
	children: React.ReactNode;
}

export function SettingsLayout({ items, activeSection, children }: SettingsLayoutProps) {
	return (
		<div className="flex flex-col md:flex-row gap-8">
			<SettingsSidebar items={items} activeSection={activeSection} />
			<div className="flex-1 min-w-0">{children}</div>
		</div>
	);
}
