import { Avatar } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { Message } from "@/lib/models/Messages";
import { addReaction } from "@/lib/requests/messages";
import { getFormattedTime } from "@/lib/utils/date";
import getUknownUser from "@/lib/utils/user";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { useState } from "react";
import { ReactionBadge } from "./ReactionBadge";
import { ReactionPicker } from "./ReactionPicker";

type MessageProps = {
	message: Message;
	type?: "direct" | "group";
	onReplyClick?: (message: Message) => void;
};

const MessageComponent = ({ message, onReplyClick }: MessageProps) => {
	const user = useAuth().userProfile;
	const uknownUser = getUknownUser();
	const queryClient = useQueryClient();
	const [showReactionPicker, setShowReactionPicker] = useState(false);
	const [reactionError, setReactionError] = useState<string | null>(null);

	const currentUserMessage = message?.sender?.userId === user?.userId;
	const currentUserId = user?.userId || "";

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

	// Render deleted message
	if (message?.isDeleted) {
		return (
			<div className={classNames("flex gap-2 p-4 items-start", currentUserMessage ? "flex-row-reverse" : "")}>
				<div className="flex-grow-1 cursor-pointer">
					<Avatar profile={message.sender ?? uknownUser} />
				</div>
				<div className={classNames(currentUserMessage ? "text-right" : "text-left", "w-full")}>
					<div className="inline-block p-2 rounded-lg max-w-[70%] bg-muted/5 italic text-muted">Message deleted</div>
				</div>
			</div>
		);
	}

	return (
		<div className={classNames("flex gap-2 p-4 items-start group", currentUserMessage ? "flex-row-reverse" : "")}>
			<div className="flex-grow-1 cursor-pointer">
				<Avatar profile={message.sender ?? uknownUser} />
			</div>
			<div className={classNames(currentUserMessage ? "text-right" : "text-left", "w-full")}>
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
							<div className={classNames("flex gap-1 mt-1 flex-wrap", currentUserMessage ? "justify-end" : "justify-start")}>
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
							<div className={classNames("text-xs text-error mt-1", currentUserMessage ? "text-right" : "text-left")}>{reactionError}</div>
						)}
					</div>

					{/* Message actions (reaction picker trigger, reply) */}
					<div
						className={classNames(
							"absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
							currentUserMessage ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
						)}>
						<button
							onClick={() => setShowReactionPicker(!showReactionPicker)}
							className="text-sm hover:bg-muted/20 p-1 rounded"
							title="Add reaction">
							😀
						</button>
						{onReplyClick && (
							<button onClick={() => onReplyClick(message)} className="text-sm hover:bg-muted/20 p-1 rounded" title="Reply">
								↩️
							</button>
						)}
					</div>

					{/* Reaction picker */}
					{showReactionPicker && <ReactionPicker onSelect={handleAddReaction} onClose={() => setShowReactionPicker(false)} />}
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
