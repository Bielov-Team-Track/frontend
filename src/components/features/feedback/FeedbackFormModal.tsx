"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, Button, Checkbox, Modal, RichTextEditor } from "@/components/ui";
import type { RichTextEditorRef } from "@/components/ui";
import { ImprovementPointsEditor } from "./ImprovementPointsEditor";
import type { ImprovementPointDraft } from "./ImprovementPointsEditor";
import { PraiseEditor } from "./PraiseEditor";
import type { PraiseDraft } from "./PraiseEditor";
import { useCreateFeedback } from "@/hooks/useFeedbackCoach";
import { showErrorToast } from "@/lib/errors";
import type { CreateFeedbackRequest } from "@/lib/models/Feedback";

// Local mapping to correct backend FeedbackMediaType values.
// The shared FeedbackMediaTypeEnum has wrong values (Article=1, Image=2)
// but backend expects: Video=0, Image=1, Document=2
const MEDIA_TYPE_TO_BACKEND: Record<string, number> = {
	Video: 0,
	Image: 1,
	Article: 2,
};

interface FeedbackFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	recipientUserId: string;
	recipientName: string;
	recipientAvatarUrl?: string;
	eventId?: string;
	eventName?: string;
	clubId?: string;
	clubName?: string;
}

export function FeedbackFormModal({
	isOpen,
	onClose,
	recipientUserId,
	recipientName,
	recipientAvatarUrl,
	eventId,
	eventName,
	clubId,
	clubName,
}: FeedbackFormModalProps) {
	const editorRef = useRef<RichTextEditorRef>(null);
	const [content, setContent] = useState("");
	const [sharedWithPlayer, setSharedWithPlayer] = useState(false);
	const [improvementPoints, setImprovementPoints] = useState<ImprovementPointDraft[]>([]);
	const [praise, setPraise] = useState<PraiseDraft | null>(null);

	const createFeedback = useCreateFeedback();

	const resetForm = useCallback(() => {
		setContent("");
		setSharedWithPlayer(false);
		setImprovementPoints([]);
		setPraise(null);
		editorRef.current?.setContent("");
	}, []);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleSubmit = async () => {
		if (!content.trim() && improvementPoints.length === 0 && !praise) {
			toast.error("Please add some feedback content, improvement points, or praise.");
			return;
		}

		const dto: CreateFeedbackRequest = {
			recipientUserId,
			eventId,
			clubId,
			content: content || undefined,
			sharedWithPlayer,
			improvementPoints: improvementPoints
				.filter((p) => p.description.trim())
				.map((p) => ({
					description: p.description,
					drillIds: p.drillIds.length > 0 ? p.drillIds : undefined,
					mediaLinks: p.mediaLinks
						.filter((m) => m.url.trim())
						.map((m) => ({
							url: m.url,
							type: MEDIA_TYPE_TO_BACKEND[m.type] ?? 0,
							title: m.title,
						})),
				})),
			praise: praise?.message.trim()
				? { message: praise.message, badgeType: praise.badgeType }
				: undefined,
		};

		try {
			await createFeedback.mutateAsync(dto);
			toast.success("Feedback saved successfully");
			handleClose();
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to save feedback" });
		}
	};

	const isSubmitting = createFeedback.isPending;

	// Build subtitle with recipient info
	const subtitle = eventName
		? `Event: ${eventName}`
		: clubName
			? `Club: ${clubName}`
			: undefined;

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Give Feedback" size="lg" preventOutsideClose>
			<div className="space-y-4">
				{/* Recipient info */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">To:</span>
					<Avatar src={recipientAvatarUrl} name={recipientName} size="xs" variant="user" />
					<span className="text-sm font-medium text-foreground">{recipientName}</span>
				</div>
				{subtitle && (
					<p className="text-xs text-muted-foreground -mt-2">{subtitle}</p>
				)}

				{/* Rich text editor */}
				<div className="rounded-xl border border-border bg-surface overflow-hidden">
					<RichTextEditor
						ref={editorRef}
						content={content}
						onChange={setContent}
						placeholder="Write your feedback here..."
						autoFocus
						className="min-h-[120px] [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 border-none bg-transparent"
					/>
				</div>

				{/* Improvement points */}
				<ImprovementPointsEditor
					points={improvementPoints}
					onChange={setImprovementPoints}
				/>

				{/* Praise */}
				<div>
					<h4 className="text-sm font-medium text-foreground mb-2">Praise (optional)</h4>
					<PraiseEditor praise={praise} onChange={setPraise} />
				</div>

				{/* Share toggle */}
				<Checkbox
					checked={sharedWithPlayer}
					onChange={setSharedWithPlayer}
					label="Share with player immediately"
					id="share-feedback"
				/>

				{/* Actions */}
				<div className="flex justify-end gap-2 pt-2 border-t border-border">
					<Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save Feedback"}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
