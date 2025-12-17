import { Avatar } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { Message } from "@/lib/models/Messages";
import { addReaction, removeReaction } from "@/lib/requests/messages";
import { getFormattedTime } from "@/lib/utils/date";
import getUknownUser from "@/lib/utils/user";
import classNames from "classnames";
import { useState } from "react";
import { ReactionPicker } from "./ReactionPicker";

type MessageProps = {
	message: Message;
	type?: "direct" | "group";
	onReplyClick?: (message: Message) => void;
};

const MessageComponent = ({ message, onReplyClick }: MessageProps) => {
	const user = useAuth().userProfile;
	const uknownUser = getUknownUser();
	const [showReactionPicker, setShowReactionPicker] = useState(false);
	const [isReacting, setIsReacting] = useState(false);

	const currentUserMessage = message.sender?.userId === user?.userId;

	const handleAddReaction = async (emoji: string) => {
		if (isReacting) return;
		try {
			setIsReacting(true);
			await addReaction(message.id, emoji);
		} catch (error) {
			console.error("Failed to add reaction:", error);
		} finally {
			setIsReacting(false);
		}
	};

	const handleRemoveReaction = async (emoji: string) => {
		if (isReacting) return;
		try {
			setIsReacting(true);
			await removeReaction(message.id, emoji);
		} catch (error) {
			console.error("Failed to remove reaction:", error);
		} finally {
			setIsReacting(false);
		}
	};

	const handleReactionClick = (emoji: string, hasReacted: boolean) => {
		if (hasReacted) {
			handleRemoveReaction(emoji);
		} else {
			handleAddReaction(emoji);
		}
	};

	// Render deleted message
	if (message.isDeleted) {
		return (
			<div
				className={classNames(
					"flex gap-2 p-4 items-start",
					currentUserMessage ? "flex-row-reverse" : ""
				)}>
				<div className="flex-grow-1 cursor-pointer">
					<Avatar profile={message.sender ?? uknownUser} />
				</div>
				<div
					className={classNames(
						currentUserMessage ? "text-right" : "text-left",
						"w-full"
					)}>
					<div className="inline-block p-2 rounded-lg max-w-[70%] bg-muted/5 italic text-muted">
						Message deleted
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={classNames(
				"flex gap-2 p-4 items-start group",
				currentUserMessage ? "flex-row-reverse" : ""
			)}>
			<div className="flex-grow-1 cursor-pointer">
				<Avatar profile={message.sender ?? uknownUser} />
			</div>
			<div
				className={classNames(
					currentUserMessage ? "text-right" : "text-left",
					"w-full"
				)}>
				{/* Reply indicator */}
				{message.replyTo && (
					<div className="text-xs text-muted bg-muted/10 p-2 rounded mb-1 max-w-[70%] inline-block">
						<span className="font-medium">
							Replying to {message.replyTo.sender?.name ?? "Unknown"}:
						</span>{" "}
						<span className="opacity-80 line-clamp-1">
							{message.replyTo.content}
						</span>
					</div>
				)}

				{/* Forwarded indicator */}
				{message.forwardedFrom && (
					<div className="text-xs text-muted italic mb-1">
						Forwarded message
					</div>
				)}

				{/* Message content */}
				<div className="relative inline-block max-w-[70%]">
					<div
						className={`p-2 rounded-lg break-all ${
							currentUserMessage
								? "bg-primary text-primary-foreground"
								: "bg-muted/10"
						}`}>
						{message.content}
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
							title="Add reaction"
						>
							😀
						</button>
						{onReplyClick && (
							<button
								onClick={() => onReplyClick(message)}
								className="text-sm hover:bg-muted/20 p-1 rounded"
								title="Reply"
							>
								↩️
							</button>
						)}
					</div>

					{/* Reaction picker */}
					{showReactionPicker && (
						<ReactionPicker
							onSelect={handleAddReaction}
							onClose={() => setShowReactionPicker(false)}
						/>
					)}
				</div>

				{/* Reactions display */}
				{message.reactions && message.reactions.length > 0 && (
					<div className={classNames(
						"flex gap-1 mt-1 flex-wrap",
						currentUserMessage ? "justify-end" : "justify-start"
					)}>
						{message.reactions.map((reaction) => (
							<button
								key={reaction.emoji}
								onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
								disabled={isReacting}
								className={classNames(
									"text-xs px-2 py-0.5 rounded-full transition-colors",
									reaction.hasReacted
										? "bg-primary/20 border border-primary/40"
										: "bg-muted/10 hover:bg-muted/20"
								)}
								title={`${reaction.count} reaction${reaction.count > 1 ? "s" : ""}`}
							>
								{reaction.emoji} {reaction.count}
							</button>
						))}
					</div>
				)}

				{/* Timestamp and edited indicator */}
				<div className="opacity-60 text-xs mt-1">
					{getFormattedTime(message.sentAt)}
					{message.isEdited && (
						<span className="ml-1 italic">(edited)</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default MessageComponent;
