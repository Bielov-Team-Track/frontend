import { EmbedCard, EmojiPicker } from "@/components";
import { MediaGallery, type MediaItem, parseEmbedUrl } from "@/components/ui/media-preview";
import { addReaction } from "@/lib/api/messages";
import { Message } from "@/lib/models/Messages";
import { stringToColor } from "@/lib/utils/color";
import { getFormattedTime } from "@/lib/utils/date";
import getUknownUser from "@/lib/utils/user";
import { useAuth } from "@/providers";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Forward, Pencil, Reply, SmilePlus, Trash2 } from "lucide-react";
import MessageContextMenu from "./MessageContextMenu";
import MessageEditForm from "./MessageEditForm";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ReactionBadge } from "./ReactionBadge";

type MessageProps = {
	message: Message;
	type?: "direct" | "group";
	onReplyClick?: (message: Message) => void;
	onForwardClick?: (message: Message) => void;
	onEditClick?: (message: Message) => void;
	onDeleteClick?: (message: Message) => void;
	isEditing?: boolean;
	onSaveEdit?: (content: string, addMediaIds?: string[], removeAttachmentIds?: string[]) => void;
	onCancelEdit?: () => void;
	isEditSaving?: boolean;
	observeRef?: (messageId: string, el: HTMLElement | null) => void;
	readStatus?: { readByCount: number; totalOthers: number };
	onRetry?: (optimisticId: string) => void;
	onDismiss?: (optimisticId: string) => void;
};

const MessageComponent = ({ message, onReplyClick, onForwardClick, onEditClick, onDeleteClick, isEditing, onSaveEdit, onCancelEdit, isEditSaving, observeRef, readStatus, onRetry, onDismiss }: MessageProps) => {
	const user = useAuth().userProfile;
	const uknownUser = getUknownUser();
	const queryClient = useQueryClient();
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [reactionError, setReactionError] = useState<string | null>(null);
	const reactionTriggerRef = useRef<HTMLButtonElement>(null);

	const rootRefCallback = useCallback(
		(el: HTMLElement | null) => {
			observeRef?.(message.id, el);
		},
		[observeRef, message.id],
	);

	const currentUserMessage = message?.sender?.id === user?.id;
	const currentUserId = user?.id || "";
	const sender = message.sender ?? uknownUser;

	const senderColor = stringToColor(sender.email || "default");
	const senderInitials = (sender.name || "?")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const handleReactionError = (error: string) => {
		setReactionError(error);
		setTimeout(() => setReactionError(null), 3000);
	};

	const updateReactionCache = (emoji: string, action: "add" | "remove") => {
		queryClient.setQueriesData<InfiniteData<Message[]>>({ queryKey: ["messages"] }, (oldData) => {
			if (!oldData?.pages) return oldData;
			return {
				...oldData,
				pages: oldData.pages.map((messages) =>
					messages.map((m) => {
						if (m.id !== message.id) return m;

						const reactions = [...(m.reactions || [])];
						const existingIndex = reactions.findIndex((r) => r.emoji === emoji);

						if (action === "add") {
							if (existingIndex >= 0) {
								if (!reactions[existingIndex].userIds.includes(currentUserId)) {
									reactions[existingIndex] = {
										...reactions[existingIndex],
										userIds: [...reactions[existingIndex].userIds, currentUserId],
									};
								}
							} else {
								reactions.push({ emoji, userIds: [currentUserId] });
							}
						} else {
							if (existingIndex >= 0) {
								const newUserIds = reactions[existingIndex].userIds.filter((id) => id !== currentUserId);
								if (newUserIds.length === 0) {
									reactions.splice(existingIndex, 1);
								} else {
									reactions[existingIndex] = { ...reactions[existingIndex], userIds: newUserIds };
								}
							}
						}

						return { ...m, reactions };
					})
				),
			};
		});
	};

	const handleReactionChange = (emoji: string, action: "add" | "remove") => {
		updateReactionCache(emoji, action);
	};

	const handleAddReaction = async (emoji: string) => {
		try {
			await addReaction(message.id, emoji);
			updateReactionCache(emoji, "add");
		} catch (error) {
			console.error("Failed to add reaction:", error);
			handleReactionError("Failed to add reaction");
		}
	};

	const SenderAvatar = () => (
		<div
			className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative select-none"
			style={{ backgroundColor: !sender.imageUrl ? senderColor : undefined }}>
			{sender.imageUrl ? (
				<Image src={sender.imageUrl} alt={sender.name || "Sender"} fill className="object-cover" />
			) : (
				<span className="text-xs font-bold text-black/70">{senderInitials}</span>
			)}
		</div>
	);

	// Render deleted message
	if (message?.isDeleted) {
		return (
			<div ref={rootRefCallback} data-testid="message-item" data-message-id={message.id} className={clsx("flex gap-2 p-4 items-start", currentUserMessage ? "flex-row-reverse" : "")}>
				<div className="shrink-0 cursor-pointer">
					<SenderAvatar />
				</div>
				<div className={clsx(currentUserMessage ? "text-right" : "text-left", "w-full")}>
					<div data-testid="deleted-message" className="inline-block p-2 rounded-lg max-w-[70%] bg-muted/5 italic text-muted">Message deleted</div>
				</div>
			</div>
		);
	}

	return (
		<MessageContextMenu
			message={message}
			isOwnMessage={currentUserMessage}
			onReply={onReplyClick}
			onForward={onForwardClick}
			onEdit={onEditClick}
			onDelete={onDeleteClick}
			onCopyText={(msg) => navigator.clipboard.writeText(msg.content)}
		>
		<div ref={rootRefCallback} data-testid="message-item" data-message-id={message.id} className={clsx("flex gap-2 p-4 items-start group", currentUserMessage ? "flex-row-reverse" : "")}>
			<div className="shrink-0 cursor-pointer">
				<SenderAvatar />
			</div>
			<div className={clsx(currentUserMessage ? "text-right" : "text-left", "w-full")}>
				{/* Reply indicator */}
				{message.replyTo && (
					<div className="text-xs text-muted bg-muted/10 p-2 rounded mb-1 max-w-[70%] inline-block">
						<span className="font-medium">Replying to {message.replyTo.sender?.name ?? "Unknown"}:</span>{" "}
						<span className="opacity-80 line-clamp-1">{message.replyTo.content}</span>
					</div>
				)}

				{/* Forwarded indicator */}
				{message.forwardedFrom && <div className="text-xs text-muted italic mb-1">Forwarded message</div>}

				{/* Message content */}
				{isEditing && onSaveEdit && onCancelEdit ? (
					<div className="inline-block max-w-[70%] w-full">
						<MessageEditForm
							message={message}
							onSave={onSaveEdit}
							onCancel={onCancelEdit}
							isSaving={isEditSaving}
						/>
					</div>
				) : (
					<div className="relative inline-block max-w-[70%]">
						<div className={`p-2 rounded-lg break-words bg-muted/10`}>
							<div data-testid="message-content" className="text-left">{message.content}</div>

							{/* Attachments */}
							{message.attachments && message.attachments.length > 0 && (
								<div data-testid="message-attachments" className="mt-2">
									<MediaGallery
										items={message.attachments.map((a) => ({
											id: a.id,
											type: a.contentType.startsWith("image/")
												? "image"
												: a.contentType.startsWith("video/")
												? "video"
												: "document",
											url: a.fileUrl,
											thumbHash: a.thumbHash,
											fileName: a.fileName,
											mimeType: a.contentType,
											fileSize: a.fileSize,
										} as MediaItem))}
									/>
								</div>
							)}

							{/* URL Embeds */}
							{message.embeds && message.embeds.length > 0 && (
								<div data-testid="message-embeds" className="mt-2 space-y-1">
									{message.embeds.map((embed) => {
										const embedInfo = parseEmbedUrl(embed.url);
										if (!embedInfo) return null;
										return (
											<EmbedCard
												key={embed.id}
												url={embed.url}
												embedInfo={embedInfo}
												title={embed.title}
												thumbnailUrl={embed.thumbnailUrl}
												variant="compact"
												playable
											/>
										);
									})}
								</div>
							)}

							{/* Reactions display */}
							{message.reactions && message.reactions.length > 0 && (
								<div data-testid="message-reactions" className={clsx("flex gap-2 mt-1 flex-wrap", currentUserMessage ? "justify-end" : "justify-start")}>
									{message.reactions.map((reaction) => (
										<ReactionBadge
											key={reaction.emoji}
											messageId={message.id}
											emoji={reaction.emoji}
											userIds={reaction.userIds}
											currentUserId={currentUserId}
											onReactionChange={handleReactionChange}
											onError={handleReactionError}
										/>
									))}
								</div>
							)}

							{/* Reaction error */}
							{reactionError && (
								<div className={clsx("text-xs text-error mt-1", currentUserMessage ? "text-right" : "text-left")}>{reactionError}</div>
							)}
						</div>

						{/* Message actions (reaction picker trigger, reply, forward) */}
						<div
							data-testid="message-actions"
							className={clsx(
								"absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-background/80 backdrop-blur-xs rounded-full border border-border p-0.5 shadow-xs",
								currentUserMessage ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2",
							)}>
							<button
								data-testid="reaction-button"
								ref={reactionTriggerRef}
								onClick={() => setShowEmojiPicker(!showEmojiPicker)}
								className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
								title="Add reaction">
								<SmilePlus size={16} />
							</button>

							{onReplyClick && (
								<button
									data-testid="reply-button"
									onClick={() => onReplyClick(message)}
									className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
									title="Reply">
									<Reply size={16} />
								</button>
							)}

							<button
								data-testid="forward-button"
								onClick={() => onForwardClick?.(message)}
								className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
								title="Forward">
								<Forward size={16} />
							</button>

							{currentUserMessage && !message.isDeleted && onEditClick && (
								<button
									data-testid="edit-button"
									onClick={() => onEditClick(message)}
									className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
									title="Edit">
									<Pencil size={16} />
								</button>
							)}

							{currentUserMessage && !message.isDeleted && onDeleteClick && (
								<button
									data-testid="delete-button"
									onClick={() => onDeleteClick(message)}
									className="p-1.5 rounded-full hover:bg-muted/20 text-error/70 hover:text-error transition-colors"
									title="Delete">
									<Trash2 size={16} />
								</button>
							)}
						</div>

						{/* Reaction picker */}
						{showEmojiPicker && (
							<EmojiPicker triggerRef={reactionTriggerRef} onSelect={handleAddReaction} onClose={() => setShowEmojiPicker(false)} />
						)}
					</div>
				)}

				{/* Timestamp, edited indicator, read receipts, and optimistic status */}
				<div data-testid="message-timestamp" className="opacity-60 text-xs mt-1">
					{getFormattedTime(message.sentAt)}
					{message.isEdited && <span data-testid="edited-indicator" className="ml-1 italic">(edited)</span>}
					{currentUserMessage && message._status === "sending" && (
						<span data-testid="message-sending" className="ml-1 inline-flex items-center gap-1 text-muted">
							<span className="w-3 h-3 border-[1.5px] border-muted/30 border-t-accent rounded-full animate-spin inline-block" />
						</span>
					)}
					{currentUserMessage && message._status === "error" && (
						<span data-testid="message-error" className="ml-1 text-error">
							Failed to send
							{onRetry && message._optimisticId && (
								<button
									data-testid="message-retry-button"
									onClick={() => onRetry(message._optimisticId!)}
									className="ml-1 underline hover:text-error/80 transition-colors"
								>
									Retry
								</button>
							)}
							{onDismiss && message._optimisticId && (
								<button
									data-testid="message-dismiss-button"
									onClick={() => onDismiss(message._optimisticId!)}
									className="ml-1 underline hover:text-error/80 transition-colors"
								>
									Dismiss
								</button>
							)}
						</span>
					)}
					{currentUserMessage && !message._status && (
						<span data-testid="read-receipt" className={clsx("ml-1 text-[11px]", readStatus && readStatus.readByCount > 0 ? "text-accent opacity-100" : "text-muted")}>
							{readStatus && readStatus.readByCount > 0 ? "✓✓" : "✓"}
						</span>
					)}
				</div>
			</div>
		</div>
		</MessageContextMenu>
	);
};

export default MessageComponent;
