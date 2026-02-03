"use client";

import { Modal, Button } from "@/components";
import { AlertCircle } from "lucide-react";

interface LoadTemplateConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (replace: boolean) => void;
	templateName: string;
}

export default function LoadTemplateConfirmModal({ isOpen, onClose, onConfirm, templateName }: LoadTemplateConfirmModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Load Template" size="sm">
			<div className="space-y-5">
				{/* Warning Message */}
				<div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
					<AlertCircle size={20} className="text-warning mt-0.5 shrink-0" />
					<div>
						<p className="text-sm text-white font-medium">Your timeline already has drills</p>
						<p className="text-xs text-muted mt-1">
							Choose how to load &quot;{templateName}&quot; into your training plan.
						</p>
					</div>
				</div>

				{/* Options */}
				<div className="space-y-3">
					<button
						onClick={() => {
							onConfirm(true);
							onClose();
						}}
						className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/50 transition-all text-left group">
						<div className="font-medium text-white group-hover:text-accent transition-colors">Replace All Drills</div>
						<div className="text-xs text-muted mt-1">Clear your current timeline and load the template</div>
					</button>

					<button
						onClick={() => {
							onConfirm(false);
							onClose();
						}}
						className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/50 transition-all text-left group">
						<div className="font-medium text-white group-hover:text-accent transition-colors">Append to End</div>
						<div className="text-xs text-muted mt-1">Keep your current drills and add the template after them</div>
					</button>
				</div>

				{/* Cancel */}
				<div className="pt-2 border-t border-white/10">
					<Button variant="ghost" color="neutral" onClick={onClose} className="w-full">
						Cancel
					</Button>
				</div>
			</div>
		</Modal>
	);
}
