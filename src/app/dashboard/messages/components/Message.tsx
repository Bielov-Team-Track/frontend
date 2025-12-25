import { ReactionPicker } from "@/components";
import { useAuth } from "@/providers";
import { Message } from "@/lib/models/Messages";
import { addReaction } from "@/lib/api/messages";
import { stringToColor } from "@/lib/utils/color";
import { getFormattedTime } from "@/lib/utils/date";
import getUknownUser from "@/lib/utils/user";
import { useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Forward, Reply, SmilePlus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { ReactionBadge } from "./ReactionBadge";

type MessageProps = {
	message: Message;
	type?: "direct" | "group";
	onReplyClick?: (message: Message) => void;
	onForwardClick?: (message: Message) => void;
};

const MessageComponent = ({ message, onReplyClick, onForwardClick }: MessageProps) => {
	const user = useAuth().userProfile;
	const uknownUser = getUknownUser();
	const queryClient = useQueryClient();
	const [showReactionPicker, setShowReactionPicker] = useState(false);
	const [reactionError, setReactionError] = useState<string | null>(null);
	const reactionTriggerRef = useRef<HTMLButtonElement>(null);

	const currentUserMessage = message?.sender?.userId === user?.userId;
	const currentUserId = user?.userId || "";
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
		queryClient.setQueriesData<Message[]>({ queryKey: ["messages"] }, (messages) => {
			if (!messages) return messages;
			return messages.map((m) => {
				if (m.id !== message.id) return m;

				const reactions = [...m.reactions];
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
			});
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
			<div className={clsx("flex gap-2 p-4 items-start", currentUserMessage ? "flex-row-reverse" : "")}>
				<div className="grow cursor-pointer">
					<SenderAvatar />
				</div>
				<div className={clsx(currentUserMessage ? "text-right" : "text-left", "w-full")}>
					<div className="inline-block p-2 rounded-lg max-w-[70%] bg-muted/5 italic text-muted">Message deleted</div>
				</div>
			</div>
		);
	}

	return (
		<div className={clsx("flex gap-2 p-4 items-start group", currentUserMessage ? "flex-row-reverse" : "")}>
			<div className="grow cursor-pointer">
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
				<div className="relative inline-block max-w-[70%]">
					<div className={`p-2 rounded-lg break-all bg-muted/10`}>
						<div className="text-left">{message.content}</div>

						{/* Reactions display */}
						{message.reactions && message.reactions.length > 0 && (
							<div className={clsx("flex gap-1 mt-1 flex-wrap", currentUserMessage ? "justify-end" : "justify-start")}>
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
						className={clsx(
							"absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-background/80 backdrop-blur-xs rounded-full border border-white/5 p-0.5 shadow-xs",
							currentUserMessage ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2"
						)}>
						<button
							ref={reactionTriggerRef}
							onClick={() => setShowReactionPicker(!showReactionPicker)}
							className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
							title="Add reaction">
							<SmilePlus size={16} />
						</button>

						{onReplyClick && (
							<button
								onClick={() => onReplyClick(message)}
								className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
								title="Reply">
								<Reply size={16} />
							</button>
						)}

						<button
							onClick={() => onForwardClick?.(message)}
							className="p-1.5 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
							title="Forward">
							<Forward size={16} />
						</button>
					</div>

					{/* Reaction picker */}
					{showReactionPicker && (
						<ReactionPicker triggerRef={reactionTriggerRef} onSelect={handleAddReaction} onClose={() => setShowReactionPicker(false)} />
					)}
				</div>

				{/* Timestamp and edited indicator */}
				<div className="opacity-60 text-xs mt-1">
					{getFormattedTime(message.sentAt)}
					{message.isEdited && <span className="ml-1 italic">(edited)</span>}
				</div>
			</div>
		</div>
	);
};

export default MessageComponent;
