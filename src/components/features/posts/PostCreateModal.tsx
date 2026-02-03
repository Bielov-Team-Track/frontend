"use client";

import { Avatar, Button, EmojiPicker, Modal, RichTextEditor, RichTextEditorRef, Select } from "@/components/";
import AttachmentsUploader, { UploadedAttachment } from "@/components/ui/attachments-uploader";
import { useCreatePost, useMediaUpload } from "@/hooks/usePosts";
import { getMentionSuggestions } from "@/lib/api/posts";
import { CreatePollRequest, Visibility, VisibilityOptions } from "@/lib/models/Post";
import { ContextType } from "@/lib/models/shared/models";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { BarChart3, Paperclip, Pin, Send, Smile } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { PollCreator } from "./polls";

interface PostCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	contextType: ContextType;
	contextId: string;
	contextName: string;
}

export default function PostCreateModal({ isOpen, onClose, contextType, contextId, contextName }: PostCreateModalProps) {
	const { userProfile } = useAuth();
	const [showPollCreator, setShowPollCreator] = useState(false);
	const [poll, setPoll] = useState<CreatePollRequest | null>(null);
	const createPost = useCreatePost();
	const uploadMutation = useMediaUpload();

	const [content, setContent] = useState("");
	const [visibility, setVisibility] = useState<Visibility>("membersOnly");
	const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [isPinned, setIsPinned] = useState(false);

	const editorRef = useRef<RichTextEditorRef>(null);
	const emojiButtonRef = useRef<HTMLButtonElement>(null);

	const hasContent = content.replace(/<[^>]*>/g, "").trim().length > 0;
	const mediaIds = attachments.filter((a) => a.status === "done").map((a) => a.id);
	const canSubmit = hasContent || mediaIds.length > 0 || poll !== null;

	const fetchMentionSuggestions = useCallback(
		(query: string) => getMentionSuggestions(contextType, contextId, query),
		[contextType, contextId]
	);

	const handleUpload = useCallback(
		async (file: File) => {
			return await uploadMutation.mutateAsync(file);
		},
		[uploadMutation]
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
		[attachments.length, handleUpload]
	);

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
		[addFiles]
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

	const handleSubmit = async () => {
		if (!canSubmit) return;

		try {
			await createPost.mutateAsync({
				contextType,
				contextId,
				content,
				visibility,
				mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
				poll: poll ?? undefined,
				isPinned: isPinned || undefined,
			});

			// Reset and close
			setContent("");
			setVisibility("membersOnly");
			setAttachments([]);
			setPoll(null);
			setShowPollCreator(false);
			setIsPinned(false);
			onClose();
		} catch (error) {
			console.error("Failed to create post:", error);
			toast.error("Failed to create post. Please try again.");
		}
	};

	const handleClose = () => {
		if (hasContent || attachments.length > 0 || poll !== null) {
			if (!confirm("Discard this post?")) return;
		}
		setContent("");
		setAttachments([]);
		setPoll(null);
		setShowPollCreator(false);
		setIsPinned(false);
		onClose();
	};

	const hasAttachments = attachments.length > 0;

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Create Post" size="lg">
			<div className="space-y-4">
				{/* Author info */}
				<div className="flex items-center gap-3">
					{userProfile && <Avatar name={userProfile.name + " " + userProfile.surname} src={userProfile.imageUrl} variant="user" />}
					<div>
						<p className="text-sm font-medium text-white">
							{userProfile?.name} {userProfile?.surname}
						</p>
						<p className="text-xs text-muted-foreground">Posting to {contextName}</p>
					</div>
				</div>

				{/* Editor with drag & drop */}
				<div
					className={cn(
						"rounded-xl border bg-white/3 overflow-hidden transition-colors",
						isDragOver ? "border-primary bg-primary/5" : "border-white/10"
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}>
					<RichTextEditor
						ref={editorRef}
						content={content}
						onChange={setContent}
						placeholder="What's on your mind?"
						autoFocus
						fetchMentionSuggestions={fetchMentionSuggestions}
						className="min-h-[100px] [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 border-none bg-transparent"
					/>

					{/* Attachments row - above toolbar */}
					{hasAttachments && (
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
						{/* Left: Actions */}
						<div className="flex items-center gap-1">
							<button
								ref={emojiButtonRef}
								type="button"
								onClick={() => setShowEmojiPicker(!showEmojiPicker)}
								className={cn(
									"p-2 rounded-lg transition-colors",
									showEmojiPicker ? "text-white bg-white/10" : "text-muted hover:text-white hover:bg-white/10"
								)}
								title="Add emoji">
								<Smile size={18} />
							</button>
							<button
								type="button"
								onClick={handleAttachClick}
								className="p-2 rounded-lg transition-colors text-muted hover:text-white hover:bg-white/10"
								title="Attach files">
								<Paperclip size={18} />
							</button>
							<button
								type="button"
								onClick={() => setShowPollCreator(!showPollCreator)}
								disabled={poll !== null}
								className={cn(
									"p-2 rounded-lg transition-colors",
									showPollCreator || poll ? "text-primary bg-primary/20" : "text-muted hover:text-white hover:bg-white/10",
									"disabled:opacity-50"
								)}
								title="Add poll">
								<BarChart3 size={18} />
							</button>
							<button
								type="button"
								onClick={() => setIsPinned(!isPinned)}
								className={cn(
									"p-2 rounded-lg transition-colors",
									isPinned ? "text-primary bg-primary/20" : "text-muted hover:text-white hover:bg-white/10"
								)}
								title="Pin post">
								<Pin size={18} />
							</button>
							{/* Drag and drop hint */}
							<span className="hidden sm:block text-[10px] text-muted/50 ml-2">or drag & drop</span>
						</div>

						{/* Emoji Picker */}
						{showEmojiPicker && <EmojiPicker triggerRef={emojiButtonRef} onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}

						{/* Right: Keyboard hint */}
						<span className="hidden sm:block text-[10px] text-muted/60">Ctrl + Enter to post</span>
					</div>
				</div>

				{/* Poll Creator */}
				{showPollCreator && !poll && (
					<PollCreator
						onSave={(newPoll) => {
							setPoll(newPoll);
							setShowPollCreator(false);
						}}
						onCancel={() => setShowPollCreator(false)}
					/>
				)}

				{/* Poll Preview */}
				{poll && (
					<div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-primary">Poll attached</span>
							<button onClick={() => setPoll(null)} className="text-xs text-muted-foreground hover:text-destructive">
								Remove
							</button>
						</div>
						<p className="text-sm text-white">{poll.question}</p>
						<p className="text-xs text-muted-foreground mt-1">{poll.options.length} options</p>
					</div>
				)}

				{/* Visibility */}
				<div className="flex items-center gap-4">
					<label className="text-sm text-muted-foreground">Visibility:</label>
					<Select value={visibility} onChange={(value) => setVisibility(value as Visibility)} options={VisibilityOptions} />
				</div>

				{/* Submit */}
				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!canSubmit || createPost.isPending} loading={createPost.isPending}>
						<Send size={16} className="mr-2" />
						Post
					</Button>
				</div>
			</div>
		</Modal>
	);
}
