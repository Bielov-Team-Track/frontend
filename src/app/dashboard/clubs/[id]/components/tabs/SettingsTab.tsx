"use client";

import DangerZoneSection from "@/components/features/clubs/settings/sections/DangerZoneSection";
import GeneralSettingsSection from "@/components/features/clubs/settings/sections/GeneralSettingsSection";
import RegistrationSection from "@/components/features/clubs/settings/sections/RegistrationSection";
import { SettingsSection } from "@/components/features/clubs/settings/SettingsSidebar";
import { Club } from "@/lib/models/Club";
import { useState } from "react";

interface SettingsTabProps {
	club: Club;
}

export default function SettingsTab({ club }: SettingsTabProps) {
	const [activeSection, setActiveSection] = useState<SettingsSection>("general");
	const handleTabChange = (tabId: SettingsSection) => {
		setActiveSection(tabId);
	};

	return (
		<div className="flex gap-8">
			{/* Content Area */}
			<div className="flex-1 min-w-0">
				{activeSection === "general" && <GeneralSettingsSection onTabChange={handleTabChange} club={club} activeTab={activeSection} />}
				{activeSection === "registration" && <RegistrationSection club={club} onTabChange={handleTabChange} activeTab={activeSection} />}
				{activeSection === "danger" && <DangerZoneSection club={club} onTabChange={handleTabChange} activeTab={activeSection} />}
			</div>
		</div>
	);
}
