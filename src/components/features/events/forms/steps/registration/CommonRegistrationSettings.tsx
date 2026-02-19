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
	const { setValue } = form;

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
			<InviteesSummaryCard selectedUsers={selectedUsersCache} onEdit={() => setIsModalOpen(true)} />

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
