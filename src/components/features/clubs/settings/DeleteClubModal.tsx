// frontend/src/components/features/clubs/settings/DeleteClubModal.tsx
"use client";

import { Button, Input, Modal } from "@/components/ui";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteClubModalProps {
	isOpen: boolean;
	clubName: string;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
}

export default function DeleteClubModal({ isOpen, clubName, onClose, onConfirm, isLoading }: DeleteClubModalProps) {
	const [confirmName, setConfirmName] = useState("");

	const isValid = confirmName === clubName;

	const handleClose = () => {
		setConfirmName("");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="md" showCloseButton={false}>
			<div className="space-y-6">
				<div className="text-center">
					<div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="text-red-400" size={32} />
					</div>
					<h3 className="text-xl font-bold text-white mb-2">Delete Club</h3>
					<p className="text-sm text-muted">
						This will permanently delete <span className="text-white font-medium">{clubName}</span> and all associated data including:
					</p>
				</div>

				<ul className="text-sm text-muted space-y-1 list-disc list-inside">
					<li>All members and their roles</li>
					<li>All teams and groups</li>
					<li>All events and attendance records</li>
					<li>All registration forms and responses</li>
				</ul>

				<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
					<p className="text-sm text-red-400 font-medium">This action cannot be undone.</p>
				</div>

				<Input
					label={`Type "${clubName}" to confirm deletion`}
					value={confirmName}
					onChange={(e) => setConfirmName(e.target.value)}
					placeholder={clubName}
					status="error"
				/>

				<div className="flex gap-3">
					<Button variant="ghost" fullWidth onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant="default" color="error" fullWidth onClick={onConfirm} disabled={!isValid} loading={isLoading}>
						Delete Club Forever
					</Button>
				</div>
			</div>
		</Modal>
	);
}
