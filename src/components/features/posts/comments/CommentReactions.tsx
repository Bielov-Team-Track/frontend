"use client";

import { EmojiPicker } from "@/components/ui";
import { useAddCommentReaction, useRemoveCommentReaction } from "@/hooks/usePosts";
import { ReactionSummary } from "@/lib/models/Post";
import { cn } from "@/lib/utils";
import { SmilePlus } from "lucide-react";
import { useRef, useState } from "react";

interface CommentReactionsProps {
	commentId: string;
	reactions: ReactionSummary[];
	compact?: boolean;
}

export default function CommentReactions({ commentId, reactions, compact = true }: CommentReactionsProps) {
	const [showPicker, setShowPicker] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const addReaction = useAddCommentReaction();
	const removeReaction = useRemoveCommentReaction();

	const handleReactionClick = (emoji: string, hasReacted: boolean) => {
		if (hasReacted) {
			removeReaction.mutate({ commentId, emoji });
		} else {
			addReaction.mutate({ commentId, emoji });
		}
	};

	const handleAddReaction = (emoji: string) => {
		const existing = reactions.find((r) => r.emoji === emoji);
		if (existing?.hasReacted) {
			removeReaction.mutate({ commentId, emoji });
		} else {
			addReaction.mutate({ commentId, emoji });
		}
		setShowPicker(false);
	};

	return (
		<div className="flex items-center gap-1 flex-wrap">
			{reactions.map((reaction) => (
				<button
					key={reaction.emoji}
					onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
					className={cn(
						"text-xs px-1.5 py-0.5 rounded-full transition-all flex items-center gap-1",
						reaction.hasReacted ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground hover:bg-white/10"
					)}>
					<span>{reaction.emoji}</span>
					<span>{reaction.count}</span>
				</button>
			))}

			<button
				ref={triggerRef}
				onClick={() => setShowPicker(!showPicker)}
				className="p-1 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
				title="Add reaction">
				<SmilePlus size={14} />
			</button>

			{showPicker && <EmojiPicker triggerRef={triggerRef} onSelect={handleAddReaction} onClose={() => setShowPicker(false)} />}
		</div>
	);
}
