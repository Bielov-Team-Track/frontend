"use client";

import { Button, Modal } from "@/components";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
	isOpen: boolean;
	title: string;
	itemName: string;
	description?: string;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
	confirmText?: string;
	cancelText?: string;
}

export default function DeleteConfirmModal({
	isOpen,
	title,
	itemName,
	description,
	onClose,
	onConfirm,
	isLoading = false,
	confirmText = "Delete",
	cancelText = "Cancel",
}: DeleteConfirmModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
			<div className="text-center">
				<div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
					<AlertTriangle className="text-red-400" size={24} />
				</div>
				<h3 className="text-lg font-bold text-white mb-2">{title}</h3>
				<p className="text-sm text-muted mb-6">
					{description || (
						<>
							Are you sure you want to delete <span className="font-medium text-white">{itemName}</span>? This action cannot be undone.
						</>
					)}
				</p>
				<div className="flex gap-12 justify-center">
					<Button variant="destructive" onClick={onConfirm} loading={isLoading}>
						{confirmText}
					</Button>
					<Button variant="secondary" onClick={onClose} disabled={isLoading}>
						{cancelText}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
