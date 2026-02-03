"use client";

import { useAddEventCommentReaction, useRemoveEventCommentReaction } from "@/hooks/useEventComments";
import { ReactionSummary } from "@/lib/models/shared/models";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";
import { useState } from "react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🏐"];

interface EventCommentReactionsProps {
	eventId: string;
	commentId: string;
	reactions: ReactionSummary[];
}

export default function EventCommentReactions({
	eventId,
	commentId,
	reactions,
}: EventCommentReactionsProps) {
	const [showPicker, setShowPicker] = useState(false);
	const addReaction = useAddEventCommentReaction(eventId);
	const removeReaction = useRemoveEventCommentReaction(eventId);

	const handleToggleReaction = (emoji: string) => {
		const existing = reactions.find((r) => r.emoji === emoji);
		if (existing?.hasReacted) {
			removeReaction.mutate({ commentId, emoji });
		} else {
			addReaction.mutate({ commentId, emoji });
		}
		setShowPicker(false);
	};

	return (
		<div className="flex items-center gap-1 flex-wrap relative">
			{/* Existing reactions */}
			{reactions.map((reaction) => (
				<button
					key={reaction.emoji}
					onClick={() => handleToggleReaction(reaction.emoji)}
					className={cn(
						"flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors",
						reaction.hasReacted
							? "bg-primary/20 text-primary border border-primary/30"
							: "bg-white/5 text-muted-foreground hover:bg-white/10"
					)}>
					<span>{reaction.emoji}</span>
					<span>{reaction.count}</span>
				</button>
			))}

			{/* Add reaction button */}
			<div className="relative">
				<button
					onClick={() => setShowPicker(!showPicker)}
					className="p-1 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
					<Smile size={14} />
				</button>

				{/* Emoji picker */}
				{showPicker && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
						<div className="absolute bottom-full left-0 mb-2 z-20 bg-raised/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl p-2 flex gap-1">
							{REACTION_EMOJIS.map((emoji) => (
								<button
									key={emoji}
									onClick={() => handleToggleReaction(emoji)}
									className="p-1.5 rounded hover:bg-white/10 transition-colors text-lg">
									{emoji}
								</button>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
