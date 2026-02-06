"use client";

import { Button, Modal } from "@/components/ui";
import { useReportPost } from "@/hooks/usePosts";
import { ReportReason, ReportReasonOptions } from "@/lib/models/Moderation";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Flag } from "lucide-react";
import { useState } from "react";

interface ReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	postId: string;
	onSuccess?: () => void;
}
// TODO: Add CAPTCHA verification to prevent spam reports
// TODO: Add error handling for already submited reports
export default function ReportModal({ isOpen, onClose, postId, onSuccess }: ReportModalProps) {
	const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
	const [description, setDescription] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const reportMutation = useReportPost();

	const handleSubmit = async () => {
		if (!selectedReason) return;

		try {
			await reportMutation.mutateAsync({
				postId,
				data: {
					reason: selectedReason,
					description: description.trim() || undefined,
				},
			});
			setIsSubmitted(true);
			onSuccess?.();
		} catch (error) {
			console.error("Failed to report post:", error);
		}
	};

	const handleClose = () => {
		setSelectedReason(null);
		setDescription("");
		setIsSubmitted(false);
		onClose();
	};

	if (isSubmitted) {
		return (
			<Modal isOpen={isOpen} onClose={handleClose} title="Report Submitted" size="sm">
				<div className="text-center py-6">
					<div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
						<Check size={32} className="text-success" />
					</div>
					<h3 className="text-lg font-medium text-white mb-2">Thank you for your report</h3>
					<p className="text-sm text-muted-foreground mb-6">Our moderators will review this post and take appropriate action.</p>
					<Button onClick={handleClose} variant={"ghost"}>
						Close
					</Button>
				</div>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Report Post" size="md">
			<div className="space-y-4">
				{/* Warning */}
				<div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
					<AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
					<p className="text-sm text-warning">
						Please only report content that violates our community guidelines. False reports may result in action against your account.
					</p>
				</div>

				{/* Reason selection */}
				<div className="space-y-2">
					<label className="text-sm font-medium text-white">Why are you reporting this post?</label>
					<div className="space-y-2">
						{ReportReasonOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => setSelectedReason(option.value as ReportReason)}
								className={cn(
									"w-full text-left p-3 rounded-xl border transition-all",
									selectedReason === option.value ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-border"
								)}>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-white">{option.label}</span>
									{selectedReason === option.value && <Check size={16} className="text-primary" />}
								</div>
								<p className="text-xs text-muted-foreground mt-1">{option.description}</p>
							</button>
						))}
					</div>
				</div>

				{/* Additional details */}
				{selectedReason && (
					<div className="space-y-2">
						<label className="text-sm font-medium text-white">Additional details (optional)</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Provide any additional context that might help our moderators..."
							rows={3}
							className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
						/>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedReason || reportMutation.isPending}
						loading={reportMutation.isPending}
						leftIcon={<Flag size={16} />}>
						Submit Report
					</Button>
				</div>
			</div>
		</Modal>
	);
}
