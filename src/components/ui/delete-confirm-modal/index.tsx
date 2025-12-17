"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "../modal";
import Button from "../button";

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
							Are you sure you want to delete{" "}
							<span className="font-medium text-white">{itemName}</span>?
							This action cannot be undone.
						</>
					)}
				</p>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						color="neutral"
						fullWidth
						onClick={onClose}
						disabled={isLoading}>
						{cancelText}
					</Button>
					<Button
						variant="solid"
						color="error"
						fullWidth
						onClick={onConfirm}
						loading={isLoading}>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
