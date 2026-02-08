import { addReaction, removeReaction } from "@/lib/api/messages";
import { clsx } from "clsx";
import { useState } from "react";

type ReactionBadgeProps = {
	messageId: string;
	emoji: string;
	userIds: string[];
	currentUserId: string;
	onReactionChange: (emoji: string, action: "add" | "remove") => void;
	onError?: (error: string) => void;
};

export const ReactionBadge = ({ messageId, emoji, userIds, currentUserId, onReactionChange, onError }: ReactionBadgeProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	const count = userIds.length;
	const hasReacted = userIds.includes(currentUserId);

	const handleClick = async () => {
		if (isLoading || !currentUserId) return;

		setIsLoading(true);
		setHasError(false);

		try {
			if (hasReacted) {
				await removeReaction(messageId, emoji);
				onReactionChange(emoji, "remove");
			} else {
				await addReaction(messageId, emoji);
				onReactionChange(emoji, "add");
			}
		} catch (err) {
			setHasError(true);
			const errorMessage = err instanceof Error ? err.message : "Failed to update reaction";
			onError?.(errorMessage);
			setTimeout(() => setHasError(false), 2000);
		} finally {
			setIsLoading(false);
		}
	};

	if (count === 0) return null;

	return (
		<button
			onClick={handleClick}
			disabled={isLoading}
			className={clsx(
				"text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer min-w-[40px]",
				hasError && "animate-shake border-error/60 bg-error/10",
				!hasError && hasReacted && "bg-primary/20 outline-solid outline-2 outline-primary/40",
				!hasError && !hasReacted && "bg-muted/10 hover:bg-muted/20",
				isLoading && "opacity-70"
			)}
			title={`${count} reaction${count > 1 ? "s" : ""}`}>
			{emoji} {isLoading ? <span className="loading loading-spinner loading-xs align-middle" /> : count}
		</button>
	);
};
