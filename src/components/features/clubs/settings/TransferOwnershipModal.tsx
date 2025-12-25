// frontend/src/components/features/clubs/settings/TransferOwnershipModal.tsx
"use client";

import { Button, Dropdown, Input, Modal } from "@/components/ui";
import { getClubMembers } from "@/lib/api/clubs";
import { ClubRole } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface TransferOwnershipModalProps {
	isOpen: boolean;
	clubId: string;
	clubName: string;
	onClose: () => void;
	onConfirm: (newOwnerUserId: string) => void;
	isLoading?: boolean;
}

export default function TransferOwnershipModal({ isOpen, clubId, clubName, onClose, onConfirm, isLoading }: TransferOwnershipModalProps) {
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [confirmName, setConfirmName] = useState("");

	const { data: members = [] } = useQuery({
		queryKey: ["club-members", clubId],
		queryFn: () => getClubMembers(clubId),
		enabled: isOpen,
	});

	// Only admins can receive ownership
	const eligibleMembers = members.filter((m) => m.role === ClubRole.Admin);

	const isValid = selectedUserId && confirmName === clubName;

	const handleConfirm = () => {
		if (selectedUserId && isValid) {
			onConfirm(selectedUserId);
		}
	};

	const handleClose = () => {
		setSelectedUserId(null);
		setConfirmName("");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Transfer Ownership" size="md">
			<div className="space-y-6">
				<p className="text-sm text-muted">
					Transfer ownership of <span className="text-white font-medium">{clubName}</span> to another admin. You will become a regular admin after the
					transfer.
				</p>

				<Dropdown
					label="Select New Owner"
					value={selectedUserId}
					onChange={(val) => setSelectedUserId(val as string)}
					options={eligibleMembers.map((m) => ({
						value: m.userId,
						label: m.userProfile?.name || m.userProfile?.email || "Unknown",
					}))}
					placeholder="Select an admin..."
				/>

				<Input label={`Type "${clubName}" to confirm`} value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={clubName} />

				<div className="flex gap-3">
					<Button variant="ghost" fullWidth onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant="default" color="warning" fullWidth onClick={handleConfirm} disabled={!isValid} loading={isLoading}>
						Transfer Ownership
					</Button>
				</div>
			</div>
		</Modal>
	);
}
