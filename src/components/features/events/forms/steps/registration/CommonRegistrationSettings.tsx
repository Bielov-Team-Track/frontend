import { CollapsibleSection } from "@/components/ui";
import { UserSelectorModal } from "@/components/features/users";
import { UserProfile } from "@/lib/models/User";
import { useCallback, useState } from "react";
import { useEventFormContext } from "../../context/EventFormContext";
import { CapacityField } from "./CapacityField";
import { InviteesSummaryCard } from "./InviteesSummaryCard";
import { RegistrationTimingFields } from "./RegistrationTimingFields";
import { RegistrationTypeSelector } from "./RegistrationTypeSelector";

export function CommonRegistrationSettings() {
	const { form, context } = useEventFormContext();
	const { watch, setValue } = form;
	const registrationType = watch("registrationType");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUsersCache, setSelectedUsersCache] = useState<UserProfile[]>([]);

	const handleSelectionConfirm = useCallback(
		(users: UserProfile[]) => {
			setSelectedUsersCache(users);
			setValue("invitees", users.map((u) => u.id));
		},
		[setValue],
	);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* 1. Registration Type */}
			<RegistrationTypeSelector />

			{/* 2. Maximum Participants (Slider) */}
			<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
				<CapacityField />
			</div>

			{/* 3. Invitees */}
			<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
				<h3 className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Invitees</h3>
				<p className="text-muted-foreground text-[10px] sm:text-sm mb-3 sm:mb-4">
					{registrationType === "closed"
						? "Add people who can participate in this event."
						: "Optionally invite specific people (they'll be notified)."}
				</p>
				<InviteesSummaryCard selectedUsers={selectedUsersCache} onEdit={() => setIsModalOpen(true)} />
			</div>

			{/* 4. Advanced Settings (collapsed) */}
			<CollapsibleSection label="Advanced Settings" defaultOpen={false}>
				<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
					<RegistrationTimingFields />
				</div>
			</CollapsibleSection>

			{/* Invitee Selector Modal */}
			<UserSelectorModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedUsers={selectedUsersCache}
				onConfirm={handleSelectionConfirm}
				title="Select Invitees"
				confirmLabel="Done"
				showFilters={true}
				defaultContext={context || undefined}
			/>
		</div>
	);
}
