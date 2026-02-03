"use client";

import { EmojiPicker } from "@/components/ui";
import { useAddPostReaction, useRemovePostReaction } from "@/hooks/usePosts";
import { ReactionSummary } from "@/lib/models/Post";
import { cn } from "@/lib/utils";
import { SmilePlus } from "lucide-react";
import { useRef, useState } from "react";

interface PostReactionsProps {
	postId: string;
	reactions: ReactionSummary[];
}

export default function PostReactions({ postId, reactions }: PostReactionsProps) {
	const [showPicker, setShowPicker] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const addReaction = useAddPostReaction();
	const removeReaction = useRemovePostReaction();

	const handleReactionClick = (emoji: string, hasReacted: boolean) => {
		if (hasReacted) {
			removeReaction.mutate({ postId, emoji });
		} else {
			addReaction.mutate({ postId, emoji });
		}
	};

	const handleAddReaction = (emoji: string) => {
		// Check if already reacted with this emoji
		const existing = reactions.find((r) => r.emoji === emoji);
		if (existing?.hasReacted) {
			removeReaction.mutate({ postId, emoji });
		} else {
			addReaction.mutate({ postId, emoji });
		}
		setShowPicker(false);
	};

	return (
		<div className="flex items-center gap-2 flex-wrap">
			{/* Existing reactions */}
			{reactions.map((reaction) => (
				<button
					key={reaction.emoji}
					onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
					className={cn(
						"text-sm px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5",
						reaction.hasReacted
							? "bg-primary/20 border border-primary/40 text-white"
							: "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
					)}>
					<span>{reaction.emoji}</span>
					<span className="text-xs">{reaction.count}</span>
				</button>
			))}

			{/* Add reaction button */}
			<button
				ref={triggerRef}
				onClick={() => setShowPicker(!showPicker)}
				className="p-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
				title="Add reaction">
				<SmilePlus size={18} />
			</button>

			{/* Reaction picker */}
			{showPicker && <EmojiPicker triggerRef={triggerRef} onSelect={handleAddReaction} onClose={() => setShowPicker(false)} />}
		</div>
	);
}
