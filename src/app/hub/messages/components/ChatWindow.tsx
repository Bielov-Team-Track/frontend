import { AttachmentsUploader, Button, EmbedCard, EmojiPicker } from "@/components";
import type { UploadedAttachment } from "@/components/ui/attachments-uploader";
import { useUrlEmbedDetection } from "@/hooks/useUrlEmbedDetection";
import { deleteMessage, editMessage, getMediaUploadUrl, restoreMessage, uploadFileToS3, type CreateEmbedInput } from "@/lib/api/messages";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Chat, Message } from "@/lib/models/Messages";
import { stringToColor } from "@/lib/utils/color";
import { getFormattedDate } from "@/lib/utils/date";
import { useAuth } from "@/providers";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, Info, Paperclip, Send, Smile } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsUserOnline } from "@/lib/realtime/chatsConnectionStore";
import { generateThumbHash } from "@/lib/utils/thumbhash";
import ChatInfoPanel from "./ChatInfoPanel";
import MessageComponent from "./Message";

type ReadStatus = { readByCount: number; totalOthers: number };

type ChatWindowProps = {
	chat: Chat;
	messages: Message[];
	onSendMessage: (text: string, mediaIds?: string[], embeds?: CreateEmbedInput[]) => Promise<void> | void;
	onRetryMessage?: (optimisticId: string) => void;
	onDismissMessage?: (optimisticId: string) => void;
	onViewChatInfo: () => void;
	onChatUpdated: (chatId: string) => void;
	onBack?: () => void;
	onLoadOlderMessages?: () => void;
	hasOlderMessages?: boolean;
	isLoadingOlderMessages?: boolean;
	lastReadMessageId?: string;
	observeMessage?: (messageId: string, el: HTMLElement | null) => void;
	readStatusMap?: Map<string, ReadStatus>;
};

const ChatWindow = ({ chat, messages, onSendMessage, onRetryMessage, onDismissMessage, onViewChatInfo, onChatUpdated, onBack, onLoadOlderMessages, hasOlderMessages, isLoadingOlderMessages, lastReadMessageId, observeMessage, readStatusMap }: ChatWindowProps) => {
	const { userProfile: currentUser } = useAuth();
	const [messageText, setMessageText] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [showInfoPanel, setShowInfoPanel] = useState(false);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
	const [deleteTargetMessage, setDeleteTargetMessage] = useState<Message | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const emojiButtonRef = useRef<HTMLButtonElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const unreadDividerRef = useRef<HTMLDivElement>(null);
	const hasScrolledToUnreadRef = useRef<string | null>(null);

	// Determine chat title and image
	const isGroup = (chat.participants?.length || 0) > 2;
	const otherParticipant = chat.participants?.find((p) => p.userId !== currentUser?.id);
	const chatTitle = chat.title || otherParticipant?.userProfile?.name || "Unknown Chat";
	const isOtherOnline = useIsUserOnline(otherParticipant?.userId || "");
	const chatSubtitle = isGroup ? `${chat.participants?.length} participants` : isOtherOnline ? "Online" : "Direct Message";

	const chatImage = chat.imageUrl || (isGroup ? undefined : otherParticipant?.userProfile?.imageUrl);
	const fallbackInitial = chatTitle.charAt(0).toUpperCase();
	const fallbackColor = stringToColor(isGroup ? `group_${chat.id}` : otherParticipant?.userProfile?.email || "default");

	const { embeds: detectedEmbeds, dismiss: dismissEmbed, reset: resetEmbeds } = useUrlEmbedDetection(messageText);

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			const fileType = file.type || "application/octet-stream";
			let thumbHash: string | undefined;
			if (fileType.startsWith("image/")) {
				try {
					thumbHash = await generateThumbHash(file);
				} catch {
					// Non-critical — proceed without thumbHash
				}
			}
			const { mediaId, uploadUrl } = await getMediaUploadUrl(fileType, file.name, file.size, thumbHash);
			await uploadFileToS3(uploadUrl, file, fileType);
			return mediaId;
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (messageId: string) => deleteMessage(messageId),
		onSuccess: (_data, messageId) => {
			setDeleteTargetMessage(null);
			toast("Message deleted", {
				action: {
					label: "Undo",
					onClick: () => handleRestore(messageId),
				},
				duration: 5000,
			});
		},
	});

	const editMutation = useMutation({
		mutationFn: ({ messageId, content, addMediaIds, removeAttachmentIds }: { messageId: string; content: string; addMediaIds?: string[]; removeAttachmentIds?: string[] }) =>
			editMessage(messageId, content, addMediaIds, removeAttachmentIds),
		onSuccess: () => {
			setEditingMessageId(null);
		},
		onError: () => {
			toast.error("Failed to edit message");
		},
	});

	const handleRestore = async (messageId: string) => {
		try {
			await restoreMessage(messageId);
		} catch {
			toast.error("Failed to restore message");
		}
	};

	const handleDeleteConfirm = () => {
		if (deleteTargetMessage) {
			deleteMutation.mutate(deleteTargetMessage.id);
		}
	};

	const handleUpload = async (file: File): Promise<string> => {
		return await uploadMutation.mutateAsync(file);
	};

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const newAttachments: UploadedAttachment[] = files.map((file) => ({
			id: crypto.randomUUID(),
			file,
			preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
			type: file.type.startsWith("image/") ? "image" as const : "document" as const,
			status: "uploading" as const,
			name: file.name,
			mimeType: file.type,
			fileSize: file.size,
		}));

		setAttachments((prev) => [...prev, ...newAttachments]);

		// Upload each file
		newAttachments.forEach(async (att) => {
			try {
				const mediaId = await handleUpload(att.file!);
				setAttachments((prev) =>
					prev.map((a) => (a.id === att.id ? { ...a, id: mediaId, status: "done" as const } : a))
				);
			} catch {
				setAttachments((prev) =>
					prev.map((a) => (a.id === att.id ? { ...a, status: "error" as const } : a))
				);
			}
		});

		// Reset input so same file can be selected again
		e.target.value = "";
	}, []);

	// Scroll to unread divider on initial load, or to bottom if no unread
	useEffect(() => {
		const doScroll = () => {
			if (hasScrolledToUnreadRef.current === chat.id) {
				// Already handled initial scroll for this chat — scroll to bottom for new messages
				messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
				return;
			}

			// Initial load for this chat
			if (unreadDividerRef.current) {
				unreadDividerRef.current.scrollIntoView({ behavior: "auto" });
			} else {
				messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
			}
			hasScrolledToUnreadRef.current = chat.id;
		};

		// Defer scroll to after DOM paint so container dimensions are settled
		const raf = requestAnimationFrame(doScroll);
		return () => cancelAnimationFrame(raf);
	}, [messages, chat.id]);

	// Reset input and scroll tracking when chat changes
	useEffect(() => {
		setMessageText("");
		setAttachments([]);
		setEditingMessageId(null);
		resetEmbeds();
		hasScrolledToUnreadRef.current = null;
		if (textAreaRef.current) {
			textAreaRef.current.style.height = "auto";
		}
	}, [chat.id]);

	const previousScrollHeightRef = useRef<number>(0);
	const isLoadingOlderRef = useRef(false);

	// Maintain scroll position when older messages are prepended
	useEffect(() => {
		if (isLoadingOlderRef.current && scrollAreaRef.current) {
			const newScrollHeight = scrollAreaRef.current.scrollHeight;
			const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
			if (scrollDiff > 0) {
				scrollAreaRef.current.scrollTop += scrollDiff;
			}
			isLoadingOlderRef.current = false;
		}
	}, [messages]);

	const handleScroll = () => {
		if (!scrollAreaRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		setShowScrollToBottom(!isNearBottom);

		// Load older messages when scrolled near top
		if (scrollTop < 100 && hasOlderMessages && !isLoadingOlderMessages && onLoadOlderMessages) {
			previousScrollHeightRef.current = scrollHeight;
			isLoadingOlderRef.current = true;
			onLoadOlderMessages();
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSend = async () => {
		const hasText = messageText.trim();
		const hasAttachments = attachments.some((a) => a.status === "done");

		if ((!hasText && !hasAttachments) || isSending) return;

		setIsSending(true);
		try {
			const mediaIds = attachments
				.filter((a) => a.status === "done")
				.map((a) => a.id);

			const embedsToSend: CreateEmbedInput[] = detectedEmbeds.map((e) => ({
				url: e.url,
				title: e.title,
				thumbnailUrl: e.thumbnailUrl,
				provider: e.embedInfo.provider,
				embedUrl: e.embedInfo.embedUrl,
			}));

			await onSendMessage(
				messageText.trim(),
				mediaIds.length > 0 ? mediaIds : undefined,
				embedsToSend.length > 0 ? embedsToSend : undefined
			);
			setMessageText("");
			setAttachments([]);
			resetEmbeds();
			if (textAreaRef.current) {
				textAreaRef.current.style.height = "auto";
			}
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessageText(e.target.value);
		// Auto-grow
		e.target.style.height = "auto";
		e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max 128px
	};

	const handleEmojiSelect = useCallback((emoji: string) => {
		const textarea = textAreaRef.current;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newText = messageText.slice(0, start) + emoji + messageText.slice(end);
			setMessageText(newText);
			requestAnimationFrame(() => {
				textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
				textarea.focus();
			});
		} else {
			setMessageText((prev) => prev + emoji);
		}
		setShowEmojiPicker(false);
	}, [messageText]);

	const sortedMessages = useMemo(() => {
		return [...messages].reverse();
	}, [messages]);

	// Determine the ID of the first unread message (the one right after lastReadMessageId)
	const firstUnreadMessageId = useMemo(() => {
		if (!lastReadMessageId) return undefined;
		const lastReadIndex = sortedMessages.findIndex((m) => m.id === lastReadMessageId);
		if (lastReadIndex === -1 || lastReadIndex >= sortedMessages.length - 1) return undefined;
		return sortedMessages[lastReadIndex + 1].id;
	}, [sortedMessages, lastReadMessageId]);

	// Group messages by date
	const groupedMessages = useMemo(() => {
		const groups: { date: string; messages: Message[] }[] = [];
		let currentDate = "";

		sortedMessages.forEach((msg) => {
			const msgDate = getFormattedDate(msg.sentAt);
			if (msgDate !== currentDate) {
				currentDate = msgDate;
				groups.push({ date: currentDate, messages: [] });
			}
			groups[groups.length - 1].messages.push(msg);
		});

		return groups;
	}, [sortedMessages]);

	return (
		<div className="flex flex-col flex-1 min-h-0 h-full relative bg-background">
			{/* Header */}
			<div data-testid="chat-header" className="flex justify-between items-center h-16 bg-background/80 backdrop-blur-md shrink-0 px-4 border-b border-border z-10">
				<div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoPanel(!showInfoPanel)}>
					{onBack && (
						<Button
							data-testid="back-button"
							size="icon"
							variant="ghost"
							color="neutral"
							onClick={(e) => {
								e.stopPropagation();
								onBack();
							}}
							className="md:hidden h-8 w-8 p-0 rounded-full shrink-0"
							title="Back to chats">
							<ChevronLeft size={20} />
						</Button>
					)}
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative"
						style={{ backgroundColor: !chatImage ? fallbackColor : undefined }}>
						{chatImage ? (
							<Image src={chatImage} alt={chatTitle} fill sizes="40px" className="object-cover" />
						) : (
							<span className="text-foreground font-bold">{fallbackInitial}</span>
						)}
					</div>
					<div className="flex flex-col">
						<span data-testid="chat-title" className="font-bold text-base leading-tight truncate text-foreground max-w-[200px] md:max-w-md">{chatTitle}</span>
						<span data-testid="chat-subtitle" className="text-xs text-muted-foreground">{chatSubtitle}</span>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<Button
						data-testid="chat-info-button"
						size="icon" variant="ghost"
						color="neutral"
						leftIcon={<Info size={20} />}
						onClick={() => setShowInfoPanel(!showInfoPanel)}
						className={showInfoPanel ? "bg-accent/10 text-accent!" : ""}
						title="Chat details"
					/>
				</div>
			</div>

			{/* Messages Area */}
			<div data-testid="messages-list" ref={scrollAreaRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6 relative">
				{isLoadingOlderMessages && (
					<div className="flex justify-center py-3">
						<div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-accent rounded-full animate-spin" />
					</div>
				)}
				{messages.length === 0 ? (
					<div data-testid="empty-messages" className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2">
						<div className="bg-surface p-4 rounded-full">
							<Smile size={48} />
						</div>
						<p>No messages yet. Start the conversation!</p>
					</div>
				) : (
					groupedMessages.map((group) => (
						<div key={group.date} className="space-y-4">
							<div className="flex justify-center sticky top-0 z-10">
								<span data-testid="date-separator" className="bg-background/80 backdrop-blur-xs border border-border text-xs font-medium px-3 py-1 rounded-full text-muted shadow-xs">
									{group.date}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								{group.messages.map((message) => (
									<div key={message.id}>
										{firstUnreadMessageId === message.id && (
											<div data-testid="unread-divider" ref={unreadDividerRef} className="flex items-center gap-3 my-3">
												<div className="flex-1 h-px bg-accent/60" />
												<span className="text-xs font-medium text-accent whitespace-nowrap">New messages</span>
												<div className="flex-1 h-px bg-accent/60" />
											</div>
										)}
										<MessageComponent
											type={isGroup ? "group" : "direct"}
											message={message}
											onReplyClick={undefined /* TODO: wire up reply */}
											onForwardClick={undefined /* TODO: wire up forward */}
											onEditClick={(msg) => setEditingMessageId(msg.id)}
											onDeleteClick={(msg) => setDeleteTargetMessage(msg)}
											isEditing={editingMessageId === message.id}
											onSaveEdit={(content, addMediaIds, removeAttachmentIds) =>
												editMutation.mutate({ messageId: message.id, content, addMediaIds, removeAttachmentIds })
											}
											onCancelEdit={() => setEditingMessageId(null)}
											isEditSaving={editMutation.isPending}
											observeRef={observeMessage}
											readStatus={readStatusMap?.get(message.id)}
											onRetry={onRetryMessage}
											onDismiss={onDismissMessage}
										/>
									</div>
								))}
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Scroll to Bottom Button */}
			{showScrollToBottom && (
				<button
					data-testid="scroll-to-bottom"
					onClick={scrollToBottom}
					className="absolute bottom-28 right-8 bg-hover text-foreground p-2 rounded-full shadow-lg hover:bg-accent/90 transition-all z-20 animate-in fade-in zoom-in">
					<ChevronDown size={20} />
				</button>
			)}

			{/* Input Area */}
			<div className="shrink-0 p-4 bg-background/50 backdrop-blur-md border-t border-border z-10">
				<div className="max-w-4xl mx-auto flex items-center gap-2 bg-surface p-2 rounded-3xl border border-border focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-xs">
					<>
						<input
							data-testid="file-input"
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
							className="hidden"
							onChange={handleFileSelect}
						/>
						<button
							data-testid="attach-button"
							onClick={() => fileInputRef.current?.click()}
							className="p-2.5 rounded-full text-muted hover:text-foreground hover:bg-hover transition-colors"
						>
							<Paperclip size={20} />
						</button>
					</>

					<textarea
						data-testid="message-input"
						ref={textAreaRef}
						value={messageText}
						onChange={handleTextChange}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-foreground placeholder:text-muted resize-none py-2.5 max-h-32 min-h-[40px] leading-relaxed outline-hidden"
						rows={1}
						disabled={isSending}
					/>

					<div className="flex items-center gap-1">
						<button
							data-testid="emoji-button"
							ref={emojiButtonRef}
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
							className="p-2.5 rounded-full text-muted hover:text-foreground hover:bg-hover transition-colors"
						>
							<Smile size={20} />
						</button>
						<button
							data-testid="send-button"
							onClick={handleSend}
							disabled={isSending || (!messageText.trim() && !attachments.some((a) => a.status === "done"))}
							className={`ml-1 p-2.5 rounded-full transition-all ${
								messageText.trim() || attachments.some((a) => a.status === "done") ? "bg-accent text-white hover:bg-accent/90" : "text-muted hover:text-foreground hover:bg-hover"
							} disabled:opacity-50`}>
							<Send size={18} />
						</button>
					</div>
				</div>

				{/* Attachment previews */}
				{attachments.length > 0 && (
					<div className="max-w-4xl mx-auto mt-2">
						<AttachmentsUploader
							attachments={attachments}
							onAttachmentsChange={setAttachments}
							onUpload={handleUpload}
							maxFiles={10}
							variant="horizontal"
						/>
					</div>
				)}

				{/* Embed previews */}
				{detectedEmbeds.length > 0 && (
					<div className="max-w-4xl mx-auto mt-2 space-y-1">
						{detectedEmbeds.map((embed) => (
							<EmbedCard
								key={embed.id}
								url={embed.url}
								embedInfo={embed.embedInfo}
								title={embed.title}
								thumbnailUrl={embed.thumbnailUrl}
								onDismiss={() => dismissEmbed(embed.id)}
								variant="compact"
							/>
						))}
					</div>
				)}
			</div>

			{showEmojiPicker && (
				<EmojiPicker
					triggerRef={emojiButtonRef}
					onSelect={handleEmojiSelect}
					onClose={() => setShowEmojiPicker(false)}
				/>
			)}

			{/* Info Panel Overlay */}
			<ChatInfoPanel chat={chat} isOpen={showInfoPanel} onClose={() => setShowInfoPanel(false)} onChatUpdated={onChatUpdated} />

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteTargetMessage} onOpenChange={(open) => !open && setDeleteTargetMessage(null)}>
				<AlertDialogContent data-testid="delete-confirmation" size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>Delete message</AlertDialogTitle>
						<AlertDialogDescription>
							Delete this message? You'll have 5 seconds to undo.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={deleteMutation.isPending}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default ChatWindow;
