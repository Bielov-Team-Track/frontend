"use client";

import { Button, EmojiPicker, RichTextEditor, RichTextEditorRef } from "@/components/ui";
import AttachmentsUploader, { UploadedAttachment } from "@/components/ui/attachments-uploader";
import { useEventMediaUpload } from "@/hooks/useEventComments";
import { getEventMentionSuggestions } from "@/lib/api/comments";
import { Media } from "@/lib/models/shared/models";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { Loader2, Paperclip, Reply, Send, Smile, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ReplyingTo {
	id: string;
	authorName: string;
	contentPreview: string;
}

interface RichCommentEditorProps {
	onSubmit: (content: string, mediaIds: string[]) => Promise<void>;
	placeholder?: string;
	autoFocus?: boolean;
	isSubmitting?: boolean;
	/** Event ID for mentions and media upload */
	eventId?: string;
	initialContent?: string;
	/** @deprecated Use initialMedia instead for full media data including previews */
	initialMediaIds?: string[];
	/** Initial media attachments (for edit mode) - includes full media data */
	initialMedia?: Media[];
	onCancel?: () => void;
	showCancel?: boolean;
	compact?: boolean;
	/** Hide the avatar (useful when parent already shows it, e.g., inline editing) */
	hideAvatar?: boolean;
	/** Reply context - when set, shows "Replying to..." inside editor */
	replyingTo?: ReplyingTo | null;
	/** Called when user cancels the reply (clicks X on reply label) */
	onCancelReply?: () => void;
	/** Called when user clicks the reply indicator to scroll to the original comment */
	onScrollToReply?: (commentId: string) => void;
	/** Hide attachment functionality (for contexts without media support) */
	hideAttachments?: boolean;
	/** Custom upload function - if not provided, uses event media upload */
	customUpload?: (file: File) => Promise<string>;
}

// Convert Media objects to UploadedAttachment format
function mediaToAttachment(media: Media): UploadedAttachment {
	const type = media.type.toLowerCase();
	return {
		id: media.id,
		preview: media.url, // Use the actual URL as preview
		type: type === "image" ? "image" : "document",
		status: "done",
		name: media.fileName ?? "file",
		mimeType: media.mimeType,
		fileSize: media.fileSize,
	};
}

export default function RichCommentEditor({
	onSubmit,
	placeholder = "Write a comment...",
	autoFocus = false,
	isSubmitting = false,
	eventId,
	initialContent = "",
	initialMediaIds = [],
	initialMedia,
	onCancel,
	showCancel = false,
	compact = false,
	hideAvatar = false,
	replyingTo,
	onCancelReply,
	onScrollToReply,
	hideAttachments = false,
	customUpload,
}: RichCommentEditorProps) {
	const { userProfile, isAuthenticated } = useAuth();
	const [content, setContent] = useState(initialContent);
	// Initialize attachments from initialMedia if provided
	const [attachments, setAttachments] = useState<UploadedAttachment[]>(() => {
		if (initialMedia && initialMedia.length > 0) {
			return initialMedia.map(mediaToAttachment);
		}
		return [];
	});
	const [isFocused, setIsFocused] = useState(autoFocus);
	const [isDragOver, setIsDragOver] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const uploadMutation = useEventMediaUpload();
	const editorRef = useRef<RichTextEditorRef>(null);
	const emojiButtonRef = useRef<HTMLButtonElement>(null);

	const handleSubmit = async () => {
		const trimmedContent = content.replace(/<p><\/p>/g, "").trim();
		if (!trimmedContent && attachments.length === 0) return;
		if (isSubmitting) return;

		const mediaIds = attachments.filter((a) => a.status === "done").map((a) => a.id);
		await onSubmit(trimmedContent, mediaIds);
		setContent("");
		setAttachments([]);
		setIsFocused(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleCancel = () => {
		setContent("");
		setAttachments([]);
		setIsFocused(false);
		onCancel?.();
	};

	const handleUpload = useCallback(
		async (file: File) => {
			if (customUpload) {
				return await customUpload(file);
			}
			return await uploadMutation.mutateAsync(file);
		},
		[uploadMutation, customUpload],
	);

	const addFiles = useCallback(
		async (files: File[]) => {
			let currentCount = attachments.length;
			for (const file of files) {
				if (currentCount >= 10) break;
				currentCount++;
				const isImage = file.type.startsWith("image/");
				const preview = isImage ? URL.createObjectURL(file) : "";
				const tempId = `temp-${Date.now()}-${Math.random()}`;
				const newAttachment: UploadedAttachment = {
					id: tempId,
					file,
					preview,
					type: isImage ? "image" : "document",
					status: "uploading",
					name: file.name,
				};
				setAttachments((prev) => [...prev, newAttachment]);
				try {
					const mediaId = await handleUpload(file);
					setAttachments((prev) => prev.map((a) => (a.id === tempId ? { ...a, id: mediaId, status: "done" as const } : a)));
				} catch {
					setAttachments((prev) => prev.map((a) => (a.id === tempId ? { ...a, status: "error" as const } : a)));
					toast.error(`Failed to upload ${file.name}`, { id: `upload-error-${tempId}` });
				}
			}
		},
		[attachments.length, handleUpload],
	);

	// Handle drag and drop on editor container
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);
			const files = Array.from(e.dataTransfer.files);
			addFiles(files);
		},
		[addFiles],
	);

	const handleAttachClick = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		input.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx";
		input.onchange = (e) => {
			const files = Array.from((e.target as HTMLInputElement).files || []);
			addFiles(files);
		};
		input.click();
	};

	const handleEmojiSelect = useCallback((emoji: string) => {
		editorRef.current?.insertContent(emoji);
		setShowEmojiPicker(false);
	}, []);

	const fetchMentionSuggestions = useCallback(
		async (query: string) => {
			if (!eventId) return [];
			const suggestions = await getEventMentionSuggestions(eventId, query);
			return suggestions.map((s) => ({
				userId: s.userId,
				displayName: s.displayName,
				avatarUrl: s.avatarUrl,
			}));
		},
		[eventId],
	);

	const hasContent = content.replace(/<p><\/p>/g, "").trim().length > 0 || attachments.length > 0;
	const hasAttachments = attachments.length > 0;

	// Auto-expand editor when replying to someone
	useEffect(() => {
		if (replyingTo) {
			setIsFocused(true);
		}
	}, [replyingTo]);

	if (!isAuthenticated) {
		return (
			<div className="bg-white/5 border border-white/5 border-dashed rounded-xl p-4 text-center">
				<p className="text-sm text-muted mb-2">Join the conversation</p>
				<Button variant="default" size="sm">
					Log in to Comment
				</Button>
			</div>
		);
	}

	// Compact collapsed state - can show "Reply to [name]..." when replying
	if (compact && !isFocused && !hasContent) {
		return replyingTo ? (
			<div
				onClick={() => setIsFocused(true)}
				className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm cursor-text hover:bg-white/8 transition-colors overflow-hidden">
				<Reply size={14} className="text-primary shrink-0" />
				<div className="flex-1 min-w-0 flex items-center gap-1.5">
					<span className="text-muted shrink-0">Reply to</span>
					<span className="text-white shrink-0">{replyingTo.authorName}</span>
					<span className="text-muted/60 truncate">&quot;{replyingTo.contentPreview}&quot;</span>
				</div>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onCancelReply?.();
					}}
					className="shrink-0 p-0.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors"
					title="Cancel reply">
					<X size={14} />
				</button>
			</div>
		) : (
			<div
				onClick={() => setIsFocused(true)}
				className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-muted cursor-text hover:bg-white/8 transition-colors">
				{placeholder}
			</div>
		);
	}

	return (
		<div
			onKeyDown={handleKeyDown}
			className={cn(
				"flex-1 rounded-xl border bg-white/3 overflow-hidden transition-colors",
				isDragOver && !hideAttachments ? "border-primary bg-primary/5" : "border-white/10",
			)}
			onDragOver={!hideAttachments ? handleDragOver : undefined}
			onDragLeave={!hideAttachments ? handleDragLeave : undefined}
			onDrop={!hideAttachments ? handleDrop : undefined}>
			{/* Reply indicator inside editor */}
			{replyingTo && (
				<div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/5 overflow-hidden">
					<Reply size={14} className="text-primary shrink-0" />
					<div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs">
						<span className="text-muted shrink-0">Replying to</span>
						<button type="button" onClick={() => onScrollToReply?.(replyingTo.id)} className="min-w-0 flex items-center gap-1.5 hover:underline">
							<span className="text-white font-medium shrink-0">{replyingTo.authorName}</span>
							<span className="text-muted/60 truncate">&quot;{replyingTo.contentPreview}&quot;</span>
						</button>
					</div>
					<button
						type="button"
						onClick={onCancelReply}
						className="shrink-0 p-0.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors"
						title="Cancel reply">
						<X size={14} />
					</button>
				</div>
			)}

			<RichTextEditor
				ref={editorRef}
				content={content}
				onChange={setContent}
				placeholder={placeholder}
				autoFocus={autoFocus || isFocused}
				fetchMentionSuggestions={eventId ? fetchMentionSuggestions : undefined}
				className="min-h-[60px] [&_.ProseMirror]:min-h-[40px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 border-none bg-transparent"
			/>

			{/* Attachments row - above toolbar */}
			{!hideAttachments && hasAttachments && (
				<div className="px-3 py-2 border-t border-white/5">
					<AttachmentsUploader
						attachments={attachments}
						onAttachmentsChange={setAttachments}
						onUpload={handleUpload}
						maxFiles={10}
						variant="compact"
						showEmptyDropzone={false}
						disableDrop
					/>
				</div>
			)}

			{/* Toolbar row */}
			<div className={cn("flex items-center justify-between px-3 py-2 bg-white/2", !hasAttachments && "border-t border-white/5")}>
				{/* Left: Attachment button + Emoji button + drag hint */}
				<div className="flex items-center gap-2">
					<button
						ref={emojiButtonRef}
						type="button"
						onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						className={cn(
							"p-1.5 rounded-lg transition-colors",
							showEmojiPicker ? "text-white bg-white/10" : "text-muted hover:text-white hover:bg-white/10",
						)}>
						<Smile size={16} />
					</button>
					{!hideAttachments && (
						<>
							<button
								type="button"
								onClick={handleAttachClick}
								className="p-1.5 rounded-lg transition-colors text-muted hover:text-white hover:bg-white/10">
								<Paperclip size={16} />
							</button>
							{/* Drag and drop hint - desktop only */}
							<span className="hidden sm:block text-[10px] text-muted/50">or drag & drop</span>
						</>
					)}
				</div>

				{/* Emoji Picker */}
				{showEmojiPicker && <EmojiPicker triggerRef={emojiButtonRef} onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}

				{/* Right: Hint + Actions */}
				<div className="flex items-center gap-2">
					{/* Keyboard hint - hidden on mobile */}
					<span className="hidden sm:block text-[10px] text-muted/60">Ctrl + Enter</span>

					{(showCancel || (compact && isFocused)) && (
						<button
							type="button"
							onClick={handleCancel}
							className="text-xs text-muted hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
							Cancel
						</button>
					)}

					<button
						type="button"
						onClick={handleSubmit}
						disabled={!hasContent || isSubmitting}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
							hasContent && !isSubmitting ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 text-muted cursor-not-allowed",
						)}>
						{isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
						<span className="hidden sm:inline">Send</span>
					</button>
				</div>
			</div>
		</div>
	);
}
