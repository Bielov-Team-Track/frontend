"use client";

import { Button } from "@/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Club, Group, Team } from "@/lib/models/Club";
import { UserProfile } from "@/lib/models/User";
import { useEffect, useState } from "react";
import UserSelector from "./UserSelector";

export interface UserSelectorModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedUsers: UserProfile[];
	onConfirm: (users: UserProfile[]) => void;
	title?: string;
	confirmLabel?: string;
	showFilters?: boolean;
	defaultContext?: Club | Group | Team;
	/** User IDs to exclude from the list (e.g., existing members of a club/team/group) */
	excludeUserIds?: string[];
	/** Restrict selection to members of a specific club (locks club filter) */
	restrictToClub?: Club;
}

export default function UserSelectorModal({
	isOpen,
	onClose,
	selectedUsers,
	onConfirm,
	title = "Select Users",
	confirmLabel = "Done",
	showFilters = true,
	defaultContext,
	excludeUserIds,
	restrictToClub,
}: UserSelectorModalProps) {
	// Local state for editing - only commit on confirm
	const [localSelected, setLocalSelected] = useState<UserProfile[]>(selectedUsers);

	// Reset local state when modal opens
	useEffect(() => {
		if (isOpen) {
			setLocalSelected(selectedUsers);
		}
	}, [isOpen, selectedUsers]);

	const handleConfirm = () => {
		onConfirm(localSelected);
		onClose();
	};

	const handleCancel = () => {
		setLocalSelected(selectedUsers);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
			<DialogContent className="sm:max-w-4xl p-0 gap-0 flex flex-col max-h-[85vh]">
				<DialogHeader className="px-6 py-4 border-b border-white/10 shrink-0">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				{/* Selector container - takes available space */}
				<div className="flex-1 min-h-0 overflow-hidden">
					<UserSelector
						selectedUsers={localSelected}
						onChange={setLocalSelected}
						showFilters={showFilters}
						showButton={false}
						defaultContext={defaultContext}
						excludeUserIds={excludeUserIds}
						restrictToClub={restrictToClub}
					/>
				</div>

				{/* Footer - always visible at bottom */}
				<div className="flex justify-between items-center px-6 py-4 border-t border-white/10 bg-neutral-900 shrink-0">
					<span className="text-sm text-muted">
						{localSelected.length} {localSelected.length === 1 ? "person" : "people"} selected
					</span>
					<div className="flex gap-3">
						<Button variant="ghost" onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleConfirm}>{confirmLabel}</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { UserSelectorModal };
