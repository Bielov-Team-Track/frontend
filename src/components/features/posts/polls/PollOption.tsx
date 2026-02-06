"use client";

import { PollOption as PollOptionType } from "@/lib/models/Post";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PollOptionProps {
	option: PollOptionType;
	isSelected: boolean;
	canVote: boolean;
	canSeeResults: boolean;
	totalVotes: number;
	allowMultiple: boolean;
	onSelect: () => void;
}

export default function PollOption({ option, isSelected, canVote, canSeeResults, totalVotes, allowMultiple, onSelect }: PollOptionProps) {
	const percentage = canSeeResults && totalVotes > 0 && option.voteCount != null ? Math.round((option.voteCount / totalVotes) * 100) : 0;

	return (
		<button
			onClick={onSelect}
			disabled={!canVote}
			className={cn(
				"relative w-full text-left rounded-xl border transition-all overflow-hidden",
				isSelected ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-border",
				!canVote && "cursor-default"
			)}>
			{/* Progress bar background */}
			{canSeeResults && <div className="absolute inset-0 bg-primary/20 transition-all duration-500" style={{ width: `${percentage}%` }} />}

			<div className="relative flex items-center gap-3 px-4 py-3">
				{/* Checkbox/Radio indicator */}
				{canVote && (
					<div
						className={cn(
							"w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-colors",
							allowMultiple ? "rounded" : "rounded-full",
							isSelected ? "border-primary bg-primary" : "border-border"
						)}>
						{isSelected && <Check size={12} className="text-white" />}
					</div>
				)}

				{/* Option content */}
				<div className="flex-1 min-w-0">
					{option.imageUrl && <img src={option.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}
					<span className="text-sm text-white">{option.content}</span>
				</div>

				{/* Results */}
				{canSeeResults && option.voteCount != null && (
					<div className="shrink-0 text-right">
						<span className="text-sm font-medium text-white">{percentage}%</span>
						<p className="text-xs text-muted-foreground">
							{option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}
						</p>
					</div>
				)}
			</div>
		</button>
	);
}
