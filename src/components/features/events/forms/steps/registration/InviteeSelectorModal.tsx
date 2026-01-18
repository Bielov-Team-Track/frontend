"use client";

import { Button } from "@/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Club, Group, Team } from "@/lib/models/Club";
import { UserProfile } from "@/lib/models/User";
import { useEffect, useState } from "react";
import InviteeSelector from "./InviteeSelector";

export interface InviteeSelectorModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedUsers: UserProfile[];
	onConfirm: (users: UserProfile[]) => void;
	title?: string;
	confirmLabel?: string;
	showFilters?: boolean;
	defaultContext?: Club | Group | Team;
}

export default function InviteeSelectorModal({
	isOpen,
	onClose,
	selectedUsers,
	onConfirm,
	title = "Select Invitees",
	confirmLabel = "Done",
	showFilters = true,
	defaultContext,
}: InviteeSelectorModalProps) {
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
					<InviteeSelector
						selectedUsers={localSelected}
						onChange={setLocalSelected}
						showFilters={showFilters}
						showButton={false}
						defaultContext={defaultContext}
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

export { InviteeSelectorModal };
